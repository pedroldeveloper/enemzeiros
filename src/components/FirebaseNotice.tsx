import { Info } from 'lucide-react';
import { firebaseConfigured, firebaseEmulatorsEnabled } from '../lib/firebase';

export function FirebaseNotice() {
  if (!firebaseConfigured) return (
    <div className="notice notice-info" role="status">
      <Info size={18} aria-hidden="true" />
      <span>Modo de apresentação. Contas e salvamento em nuvem precisam de configuração Firebase. O prompt de redação funciona sem envio automático.</span>
    </div>
  );
  if (firebaseEmulatorsEnabled) return (
    <div className="notice notice-info" role="status">
      <Info size={18} aria-hidden="true" />
      <span>Modo de emuladores local selecionado. Auth e Firestore só funcionam enquanto o Firebase CLI estiver rodando. Para usar o projeto configurado, defina VITE_USE_FIREBASE_EMULATORS=false em .env.local. O prompt de redação funciona sem envio automático.</span>
    </div>
  );
  return null;
}
