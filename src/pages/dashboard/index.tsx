import { ChangeEvent, FormEvent, useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import { addDoc, collection } from 'firebase/firestore';
import { FaShare, FaTrash } from 'react-icons/fa';
import Head from 'next/head';

import styles from './styles.module.css';
import Textarea from '@/components/textarea';
import { db } from '@/services/firebaseConfig';

interface UserProps {
  user: {
    email: string;
  }
}

export default function dashboard({ user }: UserProps) {
  const [input, setInput] = useState('');
  const [publicTask, setPublicTask] = useState(false);

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

          <article className={styles.task}>
            <div className={styles.tagContainer}>
              <label className={styles.tag}>PÚBLICO</label>
              <button className={styles.shareBtn}>
                <FaShare size={22} color="var(--COR_AZUL)" />
              </button>
            </div>

            <div className={styles.taskContent}>
              <p>Lorem ipsum dolor</p>
              <button className={styles.trashBtn}></button>
                <FaTrash size={22} color="var(--COR_VERMELHA)" />
            </div>
          </article>

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
