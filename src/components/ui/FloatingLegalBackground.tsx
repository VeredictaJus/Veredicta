import legalAuthBg from '@/assets/legal-bg-auth.svg';

export default function FloatingLegalBackground() {
  return (
    <div
      className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${legalAuthBg})` }}
    />
  );
}
