import React, { useState } from 'react';

const PaymentInfo = () => {
  const [paymentData, setPaymentData] = useState({
    actualAmount: 100000,
    deposit: 0,
    paid: 0,
    remaining: 100000,
    paymentMethod: 'Thanh toán tiền mặt tại quầy',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    let newData = { ...paymentData, [name]: numValue };

    // Tính toán lại remaining
    if (name === 'actualAmount' || name === 'paid') {
      newData.remaining = newData.actualAmount - newData.paid;
    }

    setPaymentData(newData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      {/* Header */}
      <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b">
        THÔNG TIN THANH TOÁN
      </h2>

      {/* Payment Fields */}
      <div className="space-y-3">
        {/* Thực thu */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Thực thu <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="actualAmount"
            value={paymentData.actualAmount}
            onChange={handleInputChange}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md text-right font-semibold focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Thu cọc/Thu tiếp */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Thu cọc/Thu tiếp
          </label>
          <input
            type="number"
            name="deposit"
            value={paymentData.deposit}
            onChange={handleInputChange}
            className="w-40 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Đã thu */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Đã thu
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="paid"
              value={paymentData.paid}
              onChange={handleInputChange}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <span className="text-sm text-gray-500">Còn lại</span>
            <span className="font-bold text-blue-600 min-w-[80px] text-right">
              {paymentData.remaining.toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Hình thức TT */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hình thức TT
          </label>
          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="Thanh toán tiền mặt tại quầy">Thanh toán tiền mặt tại quầy</option>
            <option value="Chuyển khoản">Chuyển khoản</option>
            <option value="Thẻ tín dụng">Thẻ tín dụng</option>
            <option value="Ví điện tử">Ví điện tử</option>
          </select>
        </div>

        {/* Thông tin vé */}
        <div className="mt-4 p-3 bg-blue-800 text-white rounded-md">
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div>
              <span className="text-blue-200">Số ghế:</span>
              <span className="font-bold ml-2">1</span>
            </div>
            <div>
              <span className="text-blue-200">Tổng tiền:</span>
              <span className="font-bold ml-2">{paymentData.actualAmount.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mb-2">
            <div>
              <span className="text-blue-200">Thực thu:</span>
              <span className="font-bold ml-2">{paymentData.actualAmount.toLocaleString('vi-VN')}</span>
            </div>
            <div>
              <span className="text-blue-200">Đã thu:</span>
              <span className="font-bold ml-2">{paymentData.paid.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          <div className="text-sm border-t border-blue-600 pt-2 mt-2">
            <p className="font-bold">0530 - 26-11-2025 (Thứ 4), xe: 60BO5307</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
            Thu tiền
          </button>
          <button className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition font-medium">
            Giữ chỗ
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentInfo;
