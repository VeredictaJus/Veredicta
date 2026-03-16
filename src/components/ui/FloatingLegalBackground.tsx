const legalAuthBg = '/f2059462-1604-46ab-80ac-e24648761145.png';

export default function FloatingLegalBackground() {
  return (
    <div
      className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${legalAuthBg})` }}
    />
  );
}
