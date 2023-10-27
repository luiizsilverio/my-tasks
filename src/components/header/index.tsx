import Link from 'next/link';
import styles from './styles.module.css';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import Image from 'next/image';

export default function Header() {
  const { data, status } = useSession();

  return (
    <header className={styles.header}>
      <section className={styles.content}>
        <nav className={styles.nav}>
          <Link href="/">
            <h1 className={styles.logo}>
              Tarefas
              <span> +</span>
            </h1>
          </Link>

          {data?.user && (
            <Link href="/dashboard" className={styles.link}>
              Meu Painel
            </Link>
          )}

        </nav>

        {status === "unauthenticated" && (
          <button className={styles.loginBtn} onClick={() => signIn('google')}>
            Acessar
          </button>
        )}

        {status === "authenticated" && (
          <button className={styles.loginBtn} onClick={() => signOut({ callbackUrl: '/' })}>
            {data!.user!.image && (
              <Image
                src={data.user!.image }
                width={32} height={32}
                alt={data.user!.name!}
                className={styles.image}
              />
            )}
            <span>Olá {data?.user?.name}</span>
          </button>
        )}

      </section>
    </header>
  )
}
