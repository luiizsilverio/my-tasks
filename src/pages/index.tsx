import { GetStaticProps } from 'next';
import Head from 'next/head'
import Image from 'next/image'
import { collection, getCountFromServer } from 'firebase/firestore';

import { db } from '@/services/firebaseConfig';
import styles from '@/styles/home.module.css'
import heroImg from '../../public/assets/hero.png';

interface ITotal {
  posts: number;
  comments: number;
}

export default function Home({ posts, comments }: ITotal) {
  return (
    <div className={styles.container}>
      <Head>
        <title>My.Tasks</title>
        <meta name="description" content="Desenvolvido durante o curso NextJS do zero ao avançado na prática 2023" />
      </Head>

      <main className={styles.main}>
        <div className={styles.logoContent}>
          <Image
            className={styles.hero}
            alt="Logo My-Tarefas"
            src={heroImg}
            priority
          />
        </div>

        <h1 className={styles.title}>
          Sistema feito para você organizar <br />
          seus estudos e tarefas
        </h1>

        <div className={styles.infoContent}>
          <section className={styles.box}>
            <span>+{posts} posts</span>
          </section>
          <section className={styles.box}>
            <span>+{comments} comentários</span>
          </section>
        </div>
      </main>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const commentRef = collection(db, "comments");
  const postRef = collection(db, "tarefas");

  const commentDoc = await getCountFromServer(commentRef);
  const postDoc = await getCountFromServer(postRef);

  return {
    props: {
      posts: postDoc.data().count,
      comments: commentDoc.data().count
    },
    revalidate: 5 * 60, /* revalida a cada 5 minutos */
  }
}
