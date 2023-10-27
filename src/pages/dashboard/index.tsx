import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Link from 'next/link';
import Head from 'next/head';
import { FaShare, FaTrash } from 'react-icons/fa';

import {
  doc,
  deleteDoc,
  addDoc,
  collection,
  query,
  orderBy,
  where,
  onSnapshot
} from 'firebase/firestore';

import styles from './styles.module.css';
import Textarea from '@/components/textarea';
import { db } from '@/services/firebaseConfig';

interface UserProps {
  user: {
    email: string;
  }
}

interface ITask {
  id: string;
  tarefa: string;
  user: string;
  public: boolean;
  created_at: Date;
}

export default function dashboard({ user }: UserProps) {
  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);
  const [tasks, setTasks] = useState<ITask[]>([]);

  function handleChangePublic(ev: ChangeEvent<HTMLInputElement>) {
    setPublicTask(ev.target.checked);
  }

  async function handleRegisterTask(ev: FormEvent) {
    ev.preventDefault();

    if (!input) return;

    try {
      await addDoc(collection(db, "tarefas"), {
        tarefa: input,
        created_at: new Date(),
        user: user?.email,
        public: publicTask
      });

      setInput("");
      setPublicTask(false);

    } catch(err) {
      console.log(err);
    }
  }

  async function handleDeleteTask(id: string) {
    try {
      const docRef = doc(db, "tarefas", id);
      await deleteDoc(docRef);
    } catch(err) {
      console.log(err);
    }
  }

  async function handleShare(id: string) {
    await navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_URL}/task/${id}`);
    alert('URL copiada!');
  }

  useEffect(() => {
    async function loadTarefas() {
      const taskRef = collection(db, "tarefas");
      const qry = query(
        taskRef,
        orderBy("created_at", "desc"),
        where("user", "==", user?.email)
      )

      onSnapshot(qry, (snapshot) => {
        let lista: ITask[] = [];

        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            tarefa: doc.data().tarefa,
            user: doc.data().user,
            public: doc.data().public,
            created_at: doc.data().created_at
          })
        })

        setTasks(lista);
      })
    }

    loadTarefas();
  }, [user?.email])

  return (
    <div className={styles.container}>
      <Head>
        <title>Meu painel de tarefas</title>
      </Head>

      <main className={styles.main}>
        <section className={styles.content}>
          <div className={styles.formContainer}>
            <h1 className={styles.title}>Qual sua tarefa?</h1>
            <form onSubmit={handleRegisterTask}>
              <Textarea
                placeholder='Digite a sua tarefa...'
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
              />
              <div className={styles.checkboxArea}>
                <input
                  type="checkbox"
                  id="public"
                  className={styles.checkbox}
                  checked={publicTask}
                  onChange={handleChangePublic}
                />
                <label htmlFor="public">Deixar tarefa pública?</label>
              </div>
              <button type="submit" className={styles.button}>Salvar</button>
            </form>
          </div>
        </section>

        <section className={styles.taskContainer}>
          <h1>Minhas Tarefas</h1>

          {tasks.map((task) => (
            <article key={task.id} className={styles.task}>

              {task.public && (
                <div className={styles.tagContainer}>
                  <label className={styles.tag}>PÚBLICO</label>
                  <button className={styles.shareBtn} onClick={() => handleShare(task.id)}>
                    <FaShare size={22} color="var(--COR_AZUL)" />
                  </button>
                </div>
              )}

              <div className={styles.taskContent}>

                {task.public ? (
                  <Link href={`/task/${task.id}`}>
                    <pre>{ task.tarefa }</pre>
                  </Link>
                ) : (
                  <pre>{ task.tarefa }</pre>
                )}

                <button
                  className={styles.trashBtn}
                  onClick={() => handleDeleteTask(task.id)}
                >
                  <FaTrash size={22} color="var(--COR_VERMELHA)" />
                </button>
              </div>
            </article>
          ))}

        </section>
      </main>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context)

  if (!session?.user) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  return {
    props: {
      user: {
        email: session?.user?.email
      }
    }
  }
}
