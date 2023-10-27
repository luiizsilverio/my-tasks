import { ChangeEvent, FormEvent, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { FaTrash } from 'react-icons/fa';
import Head from 'next/head';

import {
  doc,
  collection,
  query,
  where,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc
} from 'firebase/firestore';

import styles from './styles.module.css';
import { db } from '@/services/firebaseConfig';
import Textarea from '@/components/textarea';

interface ITask {
  item: {
    tarefa: string;
    public: boolean;
    created_at: string;
    user: string;
    id: string;
  };
  allComments: IComment[];
}

interface IComment {
  id: string;
  comment: string;
  taskId: string;
  user: string;
  name: string;
}

export default function Task({ item, allComments }: ITask) {
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const [comments, setComments] = useState<IComment[]>(allComments || []);

  async function handleComment(ev: FormEvent) {
    ev.preventDefault();
    if (!input) return;
    if (!session?.user?.email || !session.user.name) return;

    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment: input,
        name: session?.user?.name,
        user: session?.user?.email,
        taskId: item?.id,
        created_at: new Date()
      });

      const data = {
        id: docRef.id,
        comment: input,
        name: session?.user?.name,
        user: session?.user?.email,
        taskId: item?.id,
      }

      setComments((oldState) => [...oldState, data]);
      setInput("");

    } catch(err) {
      console.log(err);
    }
  }

  async function handleDelete(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);

      const lista = comments.filter(item => item.id !== id);
      setComments(lista);

    } catch(err) {
      console.log(err);
    }
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Detalhes da tarefa</title>
      </Head>

      <main className={styles.main}>
        <h1>Tarefa</h1>
        <article className={styles.task}>
          <pre>{ item.tarefa }</pre>
        </article>
      </main>

      <section className={styles.commentsContainer}>
        <h2>Comentar</h2>
        <form method='POST' onSubmit={handleComment}>
          <Textarea
            placeholder='Digite seu comentário...'
            value={input}
            onChange={(ev: ChangeEvent<HTMLTextAreaElement>) => setInput(ev.target.value)}
          />
          <button className={styles.button} disabled={!session?.user}>
            Enviar comentário
          </button>
        </form>
      </section>

      <section className={styles.commentsContainer}>
        <h2>Todos os comentários</h2>

        {comments.length === 0 && (
          <span>Nenhum comentário foi encontrado...</span>
        )}

        {comments.map((item) => (
          <article key={item.id} className={styles.comment}>
            <div className={styles.headComment}>
              <label className={styles.commentsLabel}>{ item.name }</label>

              {item.user === session?.user?.email && (
                <button
                  className={styles.btnApagar}
                  onClick={() => handleDelete(item.id)}
                >
                  <FaTrash size={18} color="var(--COR_VERMELHA)" />
                </button>
              )}

            </div>
            <pre>{ item.comment }</pre>
          </article>
        ))}

      </section>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const id = context.params?.id as string;
  const docRef = doc(db, "tarefas", id);
  const commentRef = collection(db, "comments");

  const qry = query(commentRef, where("taskId", "==", id));

  const commentDoc = await getDocs(qry);

  let allComments: IComment[] = [];

  commentDoc.forEach(doc => {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId
    })
  })

  const tarefaDoc = await getDoc(docRef);

  if (tarefaDoc.data() === undefined) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  if (!tarefaDoc.data()?.public) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const miliseconds = tarefaDoc.data()?.created_at.seconds * 1000;

  const task = {
    tarefa: tarefaDoc.data()?.tarefa,
    public: tarefaDoc.data()?.public,
    user: tarefaDoc.data()?.user,
    created_at: new Date(miliseconds).toLocaleDateString(),
    id,
  }

  return {
    props: {
      item: task,
      allComments
    }
  }
}
