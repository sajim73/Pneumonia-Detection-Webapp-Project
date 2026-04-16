import { useEffect, useState } from 'react'

export default function useFetch(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.resolve(fetcher())
      .then((res) => { if (mounted) setData(res) })
      .catch((err) => { if (mounted) setError(err) })
      .finally(() => { if (mounted) setLoading(false) })
    return () => { mounted = false }
  }, [fetcher])

  return { data, loading, error }
}
