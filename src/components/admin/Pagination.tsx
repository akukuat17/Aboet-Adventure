import Link from 'next/link';

type Props = { page: number; lastPage: number; total: number; perPage: number; basePath: string; params?: Record<string, string | undefined> };

export default function Pagination({ page, lastPage, total, perPage, basePath, params = {} }: Props) {
  if (total === 0) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set('page', String(p));
    const qs = q.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const dari = (page - 1) * perPage + 1;
  const sampai = Math.min(page * perPage, total);

  // jendela halaman: 1 … (page-2..page+2) … last
  const nomor = new Set<number>([1, lastPage]);
  for (let i = page - 2; i <= page + 2; i++) if (i >= 1 && i <= lastPage) nomor.add(i);
  const urut = [...nomor].sort((a, b) => a - b);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <p className="text-sm text-gray-600">Menampilkan {dari}–{sampai} dari {total}</p>
      {lastPage > 1 && (
        <div className="pagination">
          {page > 1 ? <Link href={href(page - 1)} aria-label="Sebelumnya">&lsaquo;</Link> : <span aria-disabled="true">&lsaquo;</span>}
          {urut.map((n, i) => (
            <span key={n} className="contents">
              {i > 0 && n - urut[i - 1] > 1 && <span>…</span>}
              {n === page ? <span className="current">{n}</span> : <Link href={href(n)}>{n}</Link>}
            </span>
          ))}
          {page < lastPage ? <Link href={href(page + 1)} aria-label="Berikutnya">&rsaquo;</Link> : <span aria-disabled="true">&rsaquo;</span>}
        </div>
      )}
    </div>
  );
}
