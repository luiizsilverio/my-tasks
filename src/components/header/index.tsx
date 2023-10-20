import Link from 'next/link';
import styles from './styles.module.css';

export default function Header() {
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
          <Link href="/dashboard" className={styles.link}>
            Meu Painel
          </Link>
        </nav>

        <button className={styles.loginBtn}>Acessar</button>
      </section>
    </header>
  )
}
