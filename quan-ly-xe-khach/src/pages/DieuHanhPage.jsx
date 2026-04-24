import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';

const API = '/api/tong-hop';

const STATUS_MAP = {
  ready:       { label: 'Sẵn sàng',    bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500' },
  running:     { label: 'Đang chạy',   bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-300',     dot: 'bg-sky-500' },
  maintenance: { label: 'Bảo dưỡng',   bg: 'bg-amber-100',   text: 'text-amber-700',   border: 'border-amber-300',   dot: 'bg-amber-500' },
  broken:      { label: 'Hỏng hóc',    bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-300',     dot: 'bg-red-500' },
};

const PRIORITY_MAP = {
  urgent: { label: 'Khẩn cấp', bg: 'bg-red-100', text: 'text-red-700' },
  high:   { label: 'Cao',      bg: 'bg-orange-100', text: 'text-orange-700' },
  normal: { label: 'Bình thường', bg: 'bg-gray-100', text: 'text-gray-600' },
  low:    { label: 'Thấp',     bg: 'bg-blue-100', text: 'text-blue-600' },
};

const TASK_STATUS = {
  pending:    { label: 'Chờ xử lý', bg: 'bg-gray-100', text: 'text-gray-600' },
  inprogress: { label: 'Đang làm',  bg: 'bg-sky-100',  text: 'text-sky-700' },
  done:       { label: 'Hoàn thành', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const today = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
};

export default function DieuHanhPage() {
  const { user } = useAuth();
  const { drivers, vehicles, timeSlots, selectedDate, setSelectedDate, formatDate } = useBooking();
  const [tab, setTab] = useState('schedule');

  // ---- Tab 1: Bảng điều hành ----
  const [scheduleDate, setScheduleDate] = useState(selectedDate || today());
  const [routes, setRoutes] = useState([]);
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // ---- Tab 2: Trạng thái xe ----
  const [vehicleStatuses, setVehicleStatuses] = useState([]);
  const [editingVehicle, setEditingVehicle] = useState(null); // { id, status, note }
  const [vsLoading, setVsLoading] = useState(false);

  // ---- Tab 3: Công việc ----
  const [tasks, setTasks] = useState([]);
  const [taskDate, setTaskDate] = useState(today());
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', dueTime: '', priority: 'normal', date: today() });
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);

  // Users list for assignment
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get(`${API}/routes`).then(r => setRoutes((r.data||[]).filter(x=>x.isActive)));
    axios.get(`${API}/auth`).then(r => setUsers(r.data||[])).catch(()=>{});
    loadVehicleStatus();
  }, []);

  useEffect(() => { if (tab === 'schedule') loadSchedule(); }, [scheduleDate, tab]);
  useEffect(() => { if (tab === 'tasks') loadTasks(); }, [taskDate, tab]);

  const loadSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await axios.get(`${API}/timeslots?date=${scheduleDate}`);
      setScheduleSlots(res.data || []);
    } catch(e) {} finally { setLoadingSchedule(false); }
  };

  const loadVehicleStatus = async () => {
    try {
      const res = await axios.get(`${API}/vehicle-status`);
      setVehicleStatuses(res.data || []);
    } catch(e) {}
  };

  const loadTasks = async () => {
    setTaskLoading(true);
    try {
      const res = await axios.get(`${API}/staff-tasks?date=${taskDate}`);
      setTasks(res.data || []);
    } catch(e) {} finally { setTaskLoading(false); }
  };

  const updateVehicleStatus = async (vehicleId, status, note) => {
    setVsLoading(true);
    try {
      await axios.post(`${API}/vehicle-status`, { vehicleId, status, note, updatedBy: user?.fullName || user?.username });
      await loadVehicleStatus();
      setEditingVehicle(null);
    } catch(e) { alert('Lỗi: ' + e.message); }
    finally { setVsLoading(false); }
  };

  const createTask = async () => {
    if (!taskForm.title.trim()) { alert('Nhập tiêu đề công việc'); return; }
    setTaskLoading(true);
    try {
      await axios.post(`${API}/staff-tasks`, { ...taskForm, createdBy: user?.fullName || user?.username });
      setTaskForm({ title: '', description: '', assignedTo: '', dueTime: '', priority: 'normal', date: taskDate });
      setShowTaskForm(false);
      await loadTasks();
    } catch(e) { alert('Lỗi: ' + e.message); }
    finally { setTaskLoading(false); }
  };

  const updateTaskStatus = async (id, status) => {
    try {
      await axios.patch(`${API}/staff-tasks/${id}`, { status });
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    } catch(e) {}
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Xóa công việc này?')) return;
    try {
      await axios.delete(`${API}/staff-tasks/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch(e) {}
  };

  // Group timeslots by route for schedule view
  const slotsByRoute = routes.reduce((acc, r) => {
    acc[r.name] = scheduleSlots.filter(s => s.route === r.name).sort((a,b) => a.time.localeCompare(b.time));
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto py-4 px-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">Điều hành xe</h1>
        <p className="text-gray-500 text-sm mt-0.5">Phân công chuyến, trạng thái xe, công việc nhân viên</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {[
          { id: 'schedule', label: '📋 Bảng phân công' },
          { id: 'vstatus', label: '🚌 Trạng thái xe' },
          { id: 'tasks', label: '✅ Công việc NV' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${tab === t.id ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== TAB 1: BẢNG PHÂN CÔNG ===== */}
      {tab === 'schedule' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-600">Ngày:</label>
            <input type="date" value={scheduleDate.split('-').reverse().join('-')}
              onChange={e => {
                const [y,m,d] = e.target.value.split('-');
                setScheduleDate(`${d}-${m}-${y}`);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400" />
            <button onClick={loadSchedule} className="px-3 py-1.5 text-sm bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition">
              Tải lại
            </button>
          </div>

          {loadingSchedule ? (
            <div className="py-12 text-center text-gray-400">Đang tải...</div>
          ) : (
            <div className="space-y-4">
              {routes.filter(r => (slotsByRoute[r.name]||[]).length > 0).map(r => (
                <div key={r.name} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-4 py-2.5 bg-sky-50 border-b border-sky-100 flex items-center gap-2">
                    <span className="font-semibold text-sky-800 text-sm">🛣 {r.name}</span>
                    <span className="text-xs text-sky-600 ml-auto">{(slotsByRoute[r.name]||[]).length} chuyến</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                          <th className="px-3 py-2 text-left font-semibold">Giờ</th>
                          <th className="px-3 py-2 text-left font-semibold">Biển số xe</th>
                          <th className="px-3 py-2 text-left font-semibold">Tài xế</th>
                          <th className="px-3 py-2 text-left font-semibold">Vé</th>
                          <th className="px-3 py-2 text-left font-semibold">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(slotsByRoute[r.name]||[]).map(slot => {
                          const bookingCount = slot.bookingCount || 0;
                          const plates = (slot.code || '').split(',').map(s=>s.trim()).filter(Boolean);
                          const driverList = (slot.driver || '').split(',').map(s=>s.trim()).filter(Boolean);
                          return (
                            <tr key={slot.id} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-bold text-sky-700 whitespace-nowrap">{slot.time}</td>
                              <td className="px-3 py-2.5">
                                {plates.length > 0
                                  ? plates.map((p,i) => <span key={i} className="inline-block bg-amber-100 text-amber-800 font-mono font-bold text-xs px-1.5 py-0.5 rounded mr-1">{p}</span>)
                                  : <span className="text-gray-300 text-xs italic">Chưa phân công</span>
                                }
                              </td>
                              <td className="px-3 py-2.5">
                                {driverList.length > 0
                                  ? driverList.map((d,i) => <span key={i} className="inline-block bg-sky-100 text-sky-700 text-xs px-1.5 py-0.5 rounded mr-1">{d}</span>)
                                  : <span className="text-gray-300 text-xs italic">Chưa phân công</span>
                                }
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`text-xs font-semibold ${bookingCount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{bookingCount}/28</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className="text-xs text-gray-400">{slot.status || '—'}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {routes.filter(r => (slotsByRoute[r.name]||[]).length > 0).length === 0 && (
                <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-sm">Chưa có timeslot nào cho ngày {scheduleDate}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===== TAB 2: TRẠNG THÁI XE ===== */}
      {tab === 'vstatus' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(STATUS_MAP).map(([k, v]) => {
              const count = vehicleStatuses.filter(vs => (vs.status||'ready') === k).length;
              return (
                <div key={k} className={`${v.bg} ${v.border} border rounded-xl p-3 text-center`}>
                  <div className={`text-2xl font-bold ${v.text}`}>{count}</div>
                  <div className={`text-xs font-medium ${v.text}`}>{v.label}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="font-semibold text-gray-700">Danh sách xe ({vehicleStatuses.length})</span>
            </div>
            {vehicleStatuses.length === 0 ? (
              <div className="py-10 text-center text-gray-400">Chưa có xe nào</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {vehicleStatuses.map(v => {
                  const s = STATUS_MAP[v.status||'ready'] || STATUS_MAP.ready;
                  const isEditing = editingVehicle?.vehicleId === v.id;
                  return (
                    <div key={v.id} className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex flex-wrap gap-3 items-end">
                          <div>
                            <p className="font-bold text-gray-800 mb-1">{v.type}</p>
                            <select value={editingVehicle.status}
                              onChange={e => setEditingVehicle(ev => ({...ev, status: e.target.value}))}
                              className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400">
                              {Object.entries(STATUS_MAP).map(([k,sv]) => <option key={k} value={k}>{sv.label}</option>)}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[180px]">
                            <label className="text-xs text-gray-500 block mb-1">Ghi chú</label>
                            <input value={editingVehicle.note} onChange={e => setEditingVehicle(ev=>({...ev,note:e.target.value}))}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400"
                              placeholder="VD: Đang thay dầu..." />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => updateVehicleStatus(v.id, editingVehicle.status, editingVehicle.note)} disabled={vsLoading}
                              className="px-4 py-1.5 bg-sky-500 text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition disabled:opacity-50">Lưu</button>
                            <button onClick={() => setEditingVehicle(null)}
                              className="px-3 py-1.5 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Hủy</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full ${s.dot} flex-shrink-0`} />
                          <div className="flex-1">
                            <span className="font-bold text-gray-800">{v.type}</span>
                            {v.note && <span className="text-xs text-gray-400 ml-2">— {v.note}</span>}
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                          {v.updatedBy && <span className="text-xs text-gray-400">bởi {v.updatedBy}</span>}
                          <button onClick={() => setEditingVehicle({ vehicleId: v.id, status: v.status||'ready', note: v.note||'' })}
                            className="text-xs px-2.5 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">Cập nhật</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB 3: CÔNG VIỆC NHÂN VIÊN ===== */}
      {tab === 'tasks' && (
        <div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <label className="text-sm font-medium text-gray-600">Ngày:</label>
            <input type="date" value={taskDate.split('-').reverse().join('-')}
              onChange={e => { const [y,m,d]=e.target.value.split('-'); const nd=`${d}-${m}-${y}`; setTaskDate(nd); setTaskForm(f=>({...f,date:nd})); }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400" />
            <div className="ml-auto flex gap-2">
              <span className="text-sm text-gray-500">{tasks.filter(t=>t.status==='done').length}/{tasks.length} hoàn thành</span>
              <button onClick={() => setShowTaskForm(f => !f)}
                className="px-4 py-1.5 bg-sky-500 text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition">
                + Thêm công việc
              </button>
            </div>
          </div>

          {/* Form thêm */}
          {showTaskForm && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4">
              <h3 className="font-semibold text-sky-800 mb-3 text-sm">Công việc mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Tiêu đề <span className="text-red-500">*</span></label>
                  <input value={taskForm.title} onChange={e=>setTaskForm(f=>({...f,title:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400"
                    placeholder="VD: Kiểm tra xe 51B-23033 trước khi xuất bến" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Giao cho</label>
                  <input value={taskForm.assignedTo} onChange={e=>setTaskForm(f=>({...f,assignedTo:e.target.value}))}
                    list="users-list"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400"
                    placeholder="Tên nhân viên..." />
                  <datalist id="users-list">
                    {users.map(u => <option key={u.id} value={u.fullName || u.username} />)}
                    {drivers.map(d => <option key={d.id} value={d.name} />)}
                  </datalist>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Giờ thực hiện</label>
                  <input type="time" value={taskForm.dueTime} onChange={e=>setTaskForm(f=>({...f,dueTime:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400" />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Mức độ ưu tiên</label>
                  <select value={taskForm.priority} onChange={e=>setTaskForm(f=>({...f,priority:e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400">
                    {Object.entries(PRIORITY_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-600 mb-1 block">Mô tả thêm</label>
                  <textarea value={taskForm.description} onChange={e=>setTaskForm(f=>({...f,description:e.target.value}))} rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-sky-400 resize-none"
                    placeholder="Chi tiết công việc..." />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={createTask} disabled={taskLoading}
                  className="px-5 py-2 bg-sky-500 text-white text-sm font-semibold rounded-lg hover:bg-sky-600 transition disabled:opacity-50">Tạo công việc</button>
                <button onClick={() => setShowTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 text-sm text-gray-600 rounded-lg hover:bg-gray-50">Hủy</button>
              </div>
            </div>
          )}

          {/* Danh sách công việc */}
          <div className="space-y-2">
            {taskLoading && <div className="py-8 text-center text-gray-400">Đang tải...</div>}
            {!taskLoading && tasks.length === 0 && (
              <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">
                <p className="text-3xl mb-2">✅</p>
                <p className="text-sm">Chưa có công việc nào cho ngày {taskDate}</p>
              </div>
            )}
            {tasks.map(task => {
              const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.normal;
              const s = TASK_STATUS[task.status] || TASK_STATUS.pending;
              return (
                <div key={task.id} className={`bg-white border rounded-xl px-4 py-3 flex items-start gap-3 transition ${task.status==='done' ? 'opacity-60 border-gray-200' : 'border-gray-200 hover:border-sky-200'}`}>
                  <button onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'pending' : 'done')}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition ${task.status==='done' ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}>
                    {task.status==='done' && <svg viewBox="0 0 20 20" fill="white" className="w-4 h-4"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-gray-800 text-sm ${task.status==='done' ? 'line-through' : ''}`}>{task.title}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${p.bg} ${p.text}`}>{p.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${s.bg} ${s.text}`}>{s.label}</span>
                    </div>
                    {task.description && <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {task.assignedTo && <span className="text-xs text-sky-600">👤 {task.assignedTo}</span>}
                      {task.dueTime && <span className="text-xs text-gray-400">🕐 {task.dueTime}</span>}
                      {task.createdBy && <span className="text-xs text-gray-400">Tạo bởi {task.createdBy}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {task.status !== 'done' && task.status !== 'inprogress' && (
                      <button onClick={() => updateTaskStatus(task.id, 'inprogress')}
                        className="text-xs px-2 py-1 text-sky-600 border border-sky-300 rounded hover:bg-sky-50">Bắt đầu</button>
                    )}
                    <button onClick={() => deleteTask(task.id)}
                      className="text-xs px-2 py-1 text-red-500 border border-red-200 rounded hover:bg-red-50">Xóa</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
