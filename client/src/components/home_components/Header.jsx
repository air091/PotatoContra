import { MdOutlineMenu } from "react-icons/md";

const Header = ({ isSidebarCollapsed, onToggleSidebar }) => {
  return (
    <header className="shrink-0 bg-secondary text-text">
      <div className="flex items-center justify-start gap-x-6 px-4 py-5 md:px-6">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-controls="app-sidebar"
          aria-expanded={!isSidebarCollapsed}
          aria-label={
            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className="cursor-pointer rounded-md p-1 transition-colors hover:bg-accent"
        >
          <MdOutlineMenu size={24} />
        </button>
        <h1 className="text-2xl">Logo</h1>
      </div>
    </header>
  );
};

export default Header;
