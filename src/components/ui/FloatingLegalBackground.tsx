export default function FloatingLegalBackground() {
  // Suporta os dois locais mais comuns da imagem no projeto:
  // 1) `public/fundo-auth.png` e 2) `public/assets/fundo-auth.png`.
  const backgroundImage =
    "url('/fundo-auth.png'), url('/assets/fundo-auth.png'), url('/assets/f2059462-16d4-46ab-80ac-a2648f76146')";

  return (
    <div
      className="auth-bg-animated fixed inset-0 z-0 bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage }}
    />
  );
}
