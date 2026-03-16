const legalAuthBg = '/f2059462-16d4-46ab-80ac-a24648f76146.png';

export default function FloatingLegalBackground() {
  return (
    <div
      className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${legalAuthBg})` }}
    />
  );
}
