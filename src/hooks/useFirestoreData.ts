import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Cliente, Cobranca } from '../app/App';

export function useFirestoreData(user: User | null) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setClientes([]);
      setCobrancas([]);
      setLoading(false);
      return;
    }

    // Listener em tempo real para clientes
    const clientesRef = collection(db, 'users', user.uid, 'clientes');
    const qClientes = query(clientesRef, orderBy('createdAt', 'desc'));
    
    const unsubClientes = onSnapshot(qClientes, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cliente[];
      setClientes(data);
    });

    // Listener em tempo real para cobranças
    const cobrancasRef = collection(db, 'users', user.uid, 'cobrancas');
    const qCobrancas = query(cobrancasRef, orderBy('createdAt', 'desc'));
    
    const unsubCobrancas = onSnapshot(qCobrancas, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Cobranca[];
      setCobrancas(data);
      setLoading(false);
    });

    return () => {
      unsubClientes();
      unsubCobrancas();
    };
  }, [user]);

  const addCliente = async (cliente: Omit<Cliente, 'id' | 'createdAt'>) => {
    if (!user) return;

    const clientesRef = collection(db, 'users', user.uid, 'clientes');
    await addDoc(clientesRef, {
      ...cliente,
      createdAt: new Date().toISOString(),
    });
  };

  const addCobranca = async (cobranca: Omit<Cobranca, 'id' | 'createdAt' | 'pixKey'>) => {
    if (!user) return;

    const pixKey = `00020126580014br.gov.bcb.pix0136${Math.random().toString(36).substring(7)}-${Math.random().toString(36).substring(7)}5204000053039865802BR5913${cobranca.clienteNome.substring(0, 13).padEnd(13, ' ')}6009SAO PAULO62070503***6304${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const cobrancasRef = collection(db, 'users', user.uid, 'cobrancas');
    await addDoc(cobrancasRef, {
      ...cobranca,
      pixKey,
      createdAt: new Date().toISOString(),
    });
  };

  const updateCobrancaStatus = async (id: string, status: Cobranca['status']) => {
    if (!user) return;

    const cobrancaRef = doc(db, 'users', user.uid, 'cobrancas', id);
    await updateDoc(cobrancaRef, {
      status,
      dataPagamento: status === 'pago' ? new Date().toISOString() : null,
    });
  };

  return {
    clientes,
    cobrancas,
    loading,
    addCliente,
    addCobranca,
    updateCobrancaStatus,
  };
}
