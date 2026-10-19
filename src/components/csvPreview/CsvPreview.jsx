import './CsvPreview.css'

// CSV 생성·파일 변경 화면이 함께 쓰는 첨부 파일 미리보기. columns 가 비어 있으면 빈 상태를 보여준다.
export default function CsvPreview({
  fileName,
  rowCount,
  columns,
  previewRows,
  showDescription = true,
}) {
  return (
    <div className='csvPreview'>
      <div className='csvPreview__header'>
        <div>
          <div className='csvPreview__title'>첨부 파일 미리보기</div>
          {showDescription && (
            <div className='csvPreview__content'>
              업로드한 데이터의 헤더와 상위 5개 행을 바로 확인할 수 있습니다.
            </div>
          )}
        </div>
        {columns.length > 0 && (
          <div className='csvPreview__meta'>
            <div className='csvPreview__badge'>{fileName}</div>
            <div className='csvPreview__badge'>{`${rowCount}개 행`}</div>
            <div className='csvPreview__badge'>{`${columns.length}개 컬럼`}</div>
          </div>
        )}
      </div>

      {columns.length > 0 ? (
        <div className='csvPreview__tableWrap'>
          <div className='csvPreview__tableTop'>
            <div className='csvPreview__tableLabel'>Preview Data</div>
            <div className='csvPreview__tableHint'>표시는 상위 5개 행으로 제한됩니다</div>
          </div>
          <div className='csvPreview__table'>
            <table>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((_, i) => (
                      <td key={i}>{row[i] ?? '-'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className='csvPreview__empty'>
          <div className='csvPreview__emptyIcon' aria-hidden='true'>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className='csvPreview__emptyTitle'>미리 볼 파일이 아직 없습니다</div>
          <div className='csvPreview__emptyDescription'>
            CSV 또는 TSV 파일을 첨부하면 이 영역에 데이터 미리보기가 표시됩니다.
          </div>
        </div>
      )}
    </div>
  )
}
