import { useLocation } from 'react-router-dom';

export default function TopLoadingBar() {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      aria-hidden="true"
      className="fixed top-0 left-0 h-[2px] bg-bib-red z-[100] top-loading-bar"
    />
  );
}