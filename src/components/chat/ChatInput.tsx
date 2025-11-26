// src/components/chat/ChatInput.tsx
import React, { useRef, ChangeEvent, KeyboardEvent, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Mic, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

// Converte o Blob do gravador em File com nome/extensão/MIME corretos
function blobToAudioFile(blob: Blob) {
  const raw = (blob.type || 'audio/webm').toLowerCase(); // ex: "audio/webm;codecs=opus"
  const mime = raw.split(';')[0];                        // ex: "audio/webm"

  let ext = 'webm';
  if (mime.includes('ogg')) ext = 'ogg';
  else if (mime.includes('mp4') || mime.includes('m4a')) ext = 'm4a';
  else if (mime.includes('mpeg') || mime.includes('mp3')) ext = 'mp3';
  else if (mime.includes('wav')) ext = 'wav';

  const name = `gravacao-${Date.now()}.${ext}`;
  const type = mime.startsWith('audio/') || mime === 'video/webm'
    ? mime
    : `audio/${ext === 'mp3' ? 'mpeg' : ext}`;

  return new File([blob], name, { type });
}

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => Promise<void>;
  onFileSelect: React.Dispatch<React.SetStateAction<File[]>>;
  selectedFiles: File[];
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onFileSelect,
  selectedFiles,
  disabled = false,
  placeholder = 'Digite uma mensagem...',
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Web Audio (para filtrar/comprimir o som)
const audioCtxRef = useRef<AudioContext | null>(null);
const destNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  // 🎤 ESTADOS/REFS DE ÁUDIO
  const [isRecording, setIsRecording] = useState(false);
  const [recordSec, setRecordSec] = useState(0);
  const [pendingAudio, setPendingAudio] = useState<{ blob: Blob; mime: string; url: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

// ===== LIMITES / UTILS PARA ARQUIVOS GRANDES =====
const MAX_UPLOAD_BYTES = 45 * 1024 * 1024; // 45MB (deixe abaixo do seu limite real)
const CHUNK_BYTES = 12 * 1024 * 1024;      // ~12MB por parte (bom para redes/APIs)

function formatBytes(n: number) {
  if (!n) return '0 B';
  const u = ['B','KB','MB','GB'];
  const i = Math.floor(Math.log(n)/Math.log(1024));
  return `${(n/Math.pow(1024,i)).toFixed(1)} ${u[i]}`;
}

/** Divide um Blob em vários File() de até chunkBytes */
function sliceBlobToFiles(
  blob: Blob,
  baseMime: string,
  baseName: string,
  chunkBytes: number
): File[] {
  const files: File[] = [];
  let part = 1;
  for (let i = 0; i < blob.size; i += chunkBytes) {
    const slice = blob.slice(i, Math.min(i + chunkBytes, blob.size), baseMime);
    const name = `${baseName}.p${String(part).padStart(2, '0')}.webm`;
    files.push(new File([slice], name, { type: baseMime }));
    part++;
  }
  return files;
}

// (opcional) se quiser manter seu anti "clicar 2x":
const filesCountRef = useRef<number>(selectedFiles.length);
useEffect(() => { filesCountRef.current = selectedFiles.length; }, [selectedFiles.length]);

function waitFor(pred: () => boolean, timeout = 700) {
  return new Promise<void>((resolve) => {
    const start = performance.now();
    const step = () => {
      if (pred()) return resolve();
      if (performance.now() - start > timeout) return resolve();
      requestAnimationFrame(step);
    };
    step();
  });
}
  
  // === PATCH 1: lista/seleção de microfones ===
const [mics, setMics] = useState<MediaDeviceInfo[]>([]);
const [selectedMicId, setSelectedMicId] = useState<string>(''); // '' = padrão

async function listMics() {
  try {
    // pede permissão 1x para liberar labels
    const tmp = await navigator.mediaDevices.getUserMedia({ audio: true });
    tmp.getTracks().forEach(t => t.stop());
  } catch {}
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    setMics(devs.filter(d => d.kind === 'audioinput'));
  } catch (e) {
    console.warn('enumerateDevices falhou:', e);
  }
}

useEffect(() => {
  void listMics();
  navigator.mediaDevices?.addEventListener?.('devicechange', listMics);
  return () => navigator.mediaDevices?.removeEventListener?.('devicechange', listMics);
}, []);

// se hardware mudar, “esquece” o microfone preferido pra deixar o SO decidir o novo default
useEffect(() => {
  const onChange = () => localStorage.removeItem('chat:lastMicId');
  navigator.mediaDevices?.addEventListener('devicechange', onChange);
  return () => navigator.mediaDevices?.removeEventListener('devicechange', onChange);
}, []);

  // cronômetro durante a gravação
  useEffect(() => {
    if (!isRecording) return;
    const id = setInterval(() => setRecordSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (pendingAudio?.url) URL.revokeObjectURL(pendingAudio.url);
      if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    destNodeRef.current = null;
    };
  }, [pendingAudio]);

  const resetRecordingState = () => {
  setIsRecording(false);
  setRecordSec(0);
  chunksRef.current = [];

  // parar tracks do microfone
  if (streamRef.current) {
    try { streamRef.current.getTracks().forEach((t) => t.stop()); } catch {}
    streamRef.current = null;
  }

  if (audioCtxRef.current) {
    try { audioCtxRef.current.close(); } catch {}
    audioCtxRef.current = null;
  }
  destNodeRef.current = null;
};

  const clearPendingAudio = () => {
  setPendingAudio((prev) => {
    try {
      if (prev?.url) URL.revokeObjectURL(prev.url);
    } catch {}
    return null;
  });
};

function readableMicError(err: any): string {
  const name = err?.name || err?.code || '';
  switch (name) {
    case 'NotAllowedError':
    case 'PermissionDeniedError':
      return 'Permissão do microfone negada no navegador.';
    case 'NotFoundError':
    case 'DevicesNotFoundError':
      return 'Nenhum microfone foi encontrado no dispositivo.';
    case 'NotReadableError':
    case 'TrackStartError':
      return 'O microfone está em uso por outro aplicativo. Feche o outro app e tente novamente.';
    case 'OverconstrainedError':
    case 'ConstraintNotSatisfiedError':
      return 'Seu dispositivo não aceita esta combinação de parâmetros de áudio. Vamos tentar um modo compatível.';
    default:
      return 'Não foi possível acessar o microfone.';
  }
}

// Preferência automática de microfone: usa o último usado (se houver) ou o "default"
async function getAutoAudioConstraints(selectedId?: string): Promise<MediaStreamConstraints> {
  const last = localStorage.getItem('chat:lastMicId') || undefined;
  const want = selectedId || last || 'default';

  // se for "default", deixe o navegador escolher; se for um id, use exact
  const deviceIdConstraint =
    want === 'default'
      ? ({ ideal: 'default' } as any)
      : ({ exact: want } as any);

  return {
    audio: {
      deviceId: deviceIdConstraint,
      channelCount: 1,
      noiseSuppression: false,
      echoCancellation: false,
      autoGainControl: false,
    },
  };
}

const startRecording = async () => {
  try {
    if (pendingAudio) clearPendingAudio();

    // encerra stream anterior (se houver)
    if (streamRef.current) {
      try { streamRef.current.getTracks().forEach(t => t.stop()); } catch {}
      streamRef.current = null;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      alert('Seu navegador não suporta gravação de áudio.');
      return;
    }

    // getUserMedia com seleção automática/do usuário + fallbacks
    let raw: MediaStream;
    try {
      raw = await navigator.mediaDevices.getUserMedia(
        await getAutoAudioConstraints(selectedMicId)
      );
    } catch (e1) {
      console.warn('[mic] fallback por erro nas constraints automáticas:', e1);
      try {
        raw = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (e2) {
        console.error('Erro ao iniciar gravação:', e2);
        alert(readableMicError(e2));
        resetRecordingState();
        return;
      }
    }
    streamRef.current = raw;

    // lembra o device realmente usado (para a próxima vez)
    try {
      const track = raw.getAudioTracks()[0];
      const usedId = track.getSettings?.().deviceId as string | undefined;
      if (usedId) {
        localStorage.setItem('chat:lastMicId', usedId);
        // atualiza o seletor (se você estiver mostrando)
        try { setSelectedMicId((prev) => prev || usedId); } catch {}
      }
    } catch {}

    // Web Audio chain — deixa o navegador escolher a sampleRate
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AC();
    audioCtxRef.current = ctx;
    try { if (ctx.state === 'suspended') await ctx.resume(); } catch {}

    const source = ctx.createMediaStreamSource(raw);

    // Filtros/dinâmica (voz mais limpa)
    const dc = ctx.createBiquadFilter(); dc.type = 'highpass'; dc.frequency.value = 20;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 8500;
    const deEss = ctx.createBiquadFilter(); deEss.type = 'peaking'; deEss.frequency.value = 6000; deEss.Q.value = 1.2; deEss.gain.value = -2;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -30; comp.knee.value = 24; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.2;
    const hs = ctx.createBiquadFilter(); hs.type = 'highshelf'; hs.frequency.value = 3000; hs.gain.value = 2;
    const makeup = ctx.createGain(); makeup.gain.value = 1.6;
    const limiter = ctx.createDynamicsCompressor(); limiter.threshold.value = -3; limiter.knee.value = 0; limiter.ratio.value = 20; limiter.attack.value = 0.003; limiter.release.value = 0.05;

    const dest = ctx.createMediaStreamDestination();
    destNodeRef.current = dest;

    source
      .connect(dc)
      .connect(hp)
      .connect(lp)
      .connect(deEss)
      .connect(comp)
      .connect(hs)
      .connect(makeup)
      .connect(limiter)
      .connect(dest);

    // MediaRecorder (qualidade melhor)
    let mime = 'audio/webm;codecs=opus';
    const MR: any = (window as any).MediaRecorder;
    if (MR?.isTypeSupported) {
      if (MR.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus';
      else if (MR.isTypeSupported('audio/webm')) mime = 'audio/webm';
      else if (MR.isTypeSupported('audio/mp4')) mime = 'audio/mp4';  // iOS/Safari
      else if (MR.isTypeSupported('audio/mpeg')) mime = 'audio/mpeg';
    }

    const mr = new MediaRecorder(dest.stream, {
  mimeType: mime,
  audioBitsPerSecond: 128_000,
  bitsPerSecond: 128_000,
});
    mediaRecorderRef.current = mr;

    chunksRef.current = [];
    setRecordSec(0);
    setIsRecording(true);

    mr.ondataavailable = (e: BlobEvent) => {
      if (e.data && e.data.size) chunksRef.current.push(e.data);
    };
    mr.onstop = async () => {
  const blob = new Blob(chunksRef.current, { type: mr.mimeType });
  const baseMime = (mr.mimeType || mime).split(';')[0] || 'audio/webm';
  const pretty = formatBytes(blob.size);

  // caso 1: tamanho OK → mantém seu fluxo atual (prévia pendente)
  if (blob.size <= MAX_UPLOAD_BYTES) {
    const url = URL.createObjectURL(blob);
    setPendingAudio({ blob, mime: baseMime, url });
    resetRecordingState();
    try { audioCtxRef.current?.close(); } catch {}
    audioCtxRef.current = null;
    return;
  }

  // caso 2: muito grande → dividir em partes e anexar direto (sem prévia)
  const ts = Date.now();
  const parts = sliceBlobToFiles(blob, baseMime, `audio-${ts}`, CHUNK_BYTES);

  onFileSelect(prev => [...prev, ...parts]);

  // aguarda o React propagar os anexos para o pai
  await new Promise<void>(r => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  // remove qualquer prévia antiga e limpa estados
  setPendingAudio(null);
  resetRecordingState();
  try { audioCtxRef.current?.close(); } catch {}
  audioCtxRef.current = null;

  // feedback simples — pode trocar por toast se preferir
  alert(`Seu áudio tinha ${pretty} e foi dividido em ${parts.length} parte(s) para envio.`);
};

  const stopRecording = () => {
    try {
      const mr = mediaRecorderRef.current;
      if (mr && mr.state !== 'inactive') mr.stop();
    } catch {}
  };

  mr.start(500);

} catch (err) {
  console.error('Erro ao iniciar gravação:', err);
  alert(readableMicError(err));
  resetRecordingState();
  try { audioCtxRef.current?.close(); } catch {}
  audioCtxRef.current = null;
}
};

const stopRecording = () => {
  try {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === 'recording') mr.stop();
  } catch (e) {
    console.warn('stopRecording falhou:', e);
  }
};

  // envia normal; se houver áudio pendente, anexa antes de enviar
  const handleSubmit = async () => {
  if (pendingAudio) {
    const baseMime = (pendingAudio.mime || 'audio/webm').split(';')[0];
    const ext =
      baseMime.includes('webm') ? 'webm' :
      baseMime.includes('mp4')  ? 'm4a'  :
      baseMime.includes('mpeg') ? 'mp3'  : 'webm';

    const file = new File([pendingAudio.blob], `audio-${Date.now()}.${ext}`, { type: baseMime });
    const before = filesCountRef.current;

    onFileSelect(prev => [...prev, file]);

    // espere o estado chegar no pai
    await waitFor(() => filesCountRef.current > before, 700);

    setPendingAudio(null);
    await onSubmit();
    return;
  }

  await onSubmit();
};

  const handleKeyDown = async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFileSelect(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  return (
    <div className="flex items-end gap-2 bg-white w-full max-w-full px-4 py-2">
      <div className="flex-1">
       {/* pré-visualização de arquivos (oculta áudios) */}
{(() => {
  // cria uma lista com o arquivo e o índice original, e filtra fora os áudios
  const preview = selectedFiles
    .map((f, i) => ({ f, i }))
    .filter(x => !x.f.type?.startsWith('audio/'));

  if (preview.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {preview.map(({ f, i }) => (
        <div
          key={`${f.name}-${i}`}
          className="group inline-flex items-center gap-2 rounded border px-2 py-1 text-xs bg-white"
          title={f.name}
        >
          <span className="truncate max-w-[180px]">{f.name}</span>
          <button
            type="button"
            onClick={() =>
              onFileSelect(prev => prev.filter((_, idx) => idx !== i))
            }
            className="opacity-60 group-hover:opacity-100"
            aria-label="Remover arquivo"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
})()}

        {/* prévia do áudio gravado */}
       {pendingAudio && (
  <div className="mb-2 rounded-xl border p-2.5 bg-orange-50/80 relative ring-1 ring-orange-200/60"
>
    <div className="text-xs font-medium text-orange-800 mb-1 pr-8">
      Áudio gravado (pendente)
    </div>
    
{/* === PATCH 2: seletor de microfone === */}
{mics.length > 0 && (
  <div className="mb-2 flex items-center gap-2 text-xs">
    <label className="text-gray-600">Microfone:</label>
    <select
      className="border rounded px-2 py-1 text-xs"
      value={selectedMicId}
      onChange={(e) => setSelectedMicId(e.target.value)}
      disabled={isRecording || disabled}
    >
      <option value="">Sistema (padrão)</option>
      {mics.map((m) => (
        <option key={m.deviceId} value={m.deviceId}>
          {m.label || `Mic (${m.deviceId.slice(0, 6)}…)`}
        </option>
      ))}
    </select>
    <button
      type="button"
      onClick={() => void listMics()}
      className="px-2 py-1 border rounded hover:bg-black/5"
      disabled={isRecording || disabled}
    >
      Atualizar
    </button>
  </div>
)}

    <button
      type="button"
      onClick={clearPendingAudio}
      className="absolute top-2 right-2 rounded-md p-1.5 hover:bg-black/5 text-red-600"
      aria-label="Excluir áudio"
      title="Excluir áudio"
    >
      <Trash2 size={16} />
    </button>

    <audio src={pendingAudio.url} controls className="w-full rounded-lg ring-1 ring-black/5" />
    <div className="mt-1 text-[11px] text-orange-700">
      Clique em <strong>Enviar</strong> para mandar este áudio.
    </div>
  </div>
)}

        <textarea
          ref={inputRef}
          className="w-full border border-gray-300 rounded-md p-2 text-sm h-auto min-h-[40px] max-h-[200px] overflow-hidden focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 resize-none"
          rows={1}
          style={{ height: 'auto' }}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            const el = inputRef.current;
            if (el) {
              el.style.height = 'auto';
              el.style.height = `${el.scrollHeight}px`;
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
        />

        {/* indicador de gravação */}
        {isRecording && (
          <div className="mt-1 text-xs text-red-600 flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            Gravando… {String(Math.floor(recordSec / 60)).padStart(2, '0')}:
            {String(recordSec % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* anexar arquivos */}
      <label
  className={cn(
    'inline-flex items-center justify-center rounded-md p-2 transition',
    'text-gray-700 hover:bg-black/5',
    'focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-1',
    disabled && 'opacity-50 pointer-events-none'
  )}
  title="Anexar arquivo"
  aria-label="Anexar arquivo"
>
  <input
    type="file"
    multiple
    accept="image/*,application/pdf,audio/*,video/webm"
    className="hidden"
    onChange={handleFilesChange}
    disabled={disabled}
  />
  <Paperclip className="h-5 w-5" />
</label>

      {/* gravar/parar áudio */}
      <button
        type="button"
        onClick={() => (isRecording ? stopRecording() : startRecording())}
        className={cn(
          'rounded-md p-2 transition',
          isRecording ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'hover:bg-black/5 text-gray-700',
          disabled && 'opacity-50 pointer-events-none'
        )}
        title={isRecording ? 'Parar gravação' : 'Gravar áudio'}
        aria-label={isRecording ? 'Parar gravação' : 'Gravar áudio'}
        disabled={disabled}
      >
        {isRecording ? <Square size={18} /> : <Mic size={18} />}
      </button>

      {/* enviar (habilita se houver texto, arquivo OU áudio pendente) */}
      <Button
        variant="default"
        disabled={disabled || (value.trim().length === 0 && selectedFiles.length === 0 && !pendingAudio)}
        onClick={handleSubmit}
      >
        Enviar
      </Button>
    </div>
  );
};

export default ChatInput;
