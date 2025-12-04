const DieuHanhPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Điều Hành Xe</h1>

      {/* Empty State */}
      <div className="text-center py-20 text-gray-500">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="text-xl font-medium text-gray-600 mb-2">Module Điều Hành</p>
        <p className="text-sm text-gray-400">Trang này sẵn sàng cho phát triển tính năng điều hành xe</p>
      </div>
    </div>
  );
};

export default DieuHanhPage;
