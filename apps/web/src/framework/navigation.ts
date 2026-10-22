import { useNavigate } from 'react-router';
export function usePublicNavigation() {
  const navigate = useNavigate();
  return (sub: 'root' | 'chicken' | 'turkey' | 'corporate' | 'portal', reg: string) => {
    const base =
      sub === 'chicken'
        ? '/chickens'
        : sub === 'turkey'
          ? '/turkeys'
          : sub === 'root'
            ? '/'
            : `/${sub}`;
    navigate(reg ? `${base}/${reg}` : base);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}
