import { MdOutlineMenu } from "react-icons/md";

const Header = () => {
  return (
    <header className="bg-secondary text-text w-full max-w-480">
      <div className="flex items-center justify-start p-6 gap-x-6">
        <div className="cursor-pointer">
          <MdOutlineMenu size={24} />
        </div>
        <h1 className="text-2xl">Logo</h1>
      </div>
    </header>
  );
}

export default Header;