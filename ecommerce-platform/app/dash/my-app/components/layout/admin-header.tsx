import SidebarToggleBtn from './sidebar-toggle-btn';
import AdminSearchBar from './admin-search-bar';
import HeaderActions from './header-actions';

const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-[70px] px-8 bg-white border-b border-[#E0E0E0]">
      {/* Left: Toggle + Search */}
      <div className="flex items-center gap-4 flex-1">
        <SidebarToggleBtn />
        <AdminSearchBar />
      </div>

      {/* Right: Actions */}
      <HeaderActions />
    </header>
  );
};

export default AdminHeader;
