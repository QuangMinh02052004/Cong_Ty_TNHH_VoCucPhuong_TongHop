const CSKHPage = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Chăm Sóc Khách Hàng</h1>

      {/* Empty State */}
      <div className="text-center py-20 text-gray-500">
        <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <p className="text-xl font-medium text-gray-600 mb-2">Module CSKH</p>
        <p className="text-sm text-gray-400">Trang này sẵn sàng cho phát triển tính năng chăm sóc khách hàng</p>
      </div>
    </div>
  );
};

export default CSKHPage;
