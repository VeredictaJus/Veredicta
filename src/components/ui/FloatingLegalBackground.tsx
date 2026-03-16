export default function FloatingLegalBackground() {
  // Use `public/assets/fundo-auth.png` como imagem principal do fundo dos auth.
  const backgroundImage = "url('/assets/fundo-auth.png'), url('/assets/f2059462-16d4-46ab-80ac-a2648f76146')";

  return (
    <div
      className="fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage }}
    />
  );
}
