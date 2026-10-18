// 새 파일의 헤더에 남아 있는 컬럼만 순서대로 남긴다. 표시 컬럼은 검색 컬럼과 겹치지 않게 한다.
// 첫 업로드에는 이벤트의 기존 설정을, 이후 파일 변경에는 사용자가 현재 선택한 값을 넘긴다.
export const keepAvailableColumns = ({ searchColumns, displayColumns }, headers) => {
  const available = new Set(headers)
  const nextSearch = searchColumns.filter((column) => available.has(column))
  const nextDisplay = displayColumns.filter(
    (column) => available.has(column) && !nextSearch.includes(column),
  )

  return { searchColumns: nextSearch, displayColumns: nextDisplay }
}
