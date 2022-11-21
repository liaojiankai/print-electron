import { useState } from 'react'
import styles from 'styles/app.module.scss'
import Page from './Page';


const App: React.FC = () => {
  const [count, setCount] = useState(0)

  return (
    <div className={styles.app}>
      <Page />
    </div>
  )
}

export default App
