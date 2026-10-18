export const isLocalPreviewMode = import.meta.env.DEV

export const LOCAL_PREVIEW_READ_ONLY_MESSAGE =
  '로컬 미리보기 모드에서는 서버 데이터를 생성하거나 삭제할 수 없습니다.'

const previewUser = {
  nickname: '로컬 미리보기',
  email: 'preview@hubspace.local',
}

const previewEvents = [
  {
    id: 'preview-form-001',
    eventTitle: '여름 세미나 신청',
    eventType: 'FORM',
    isActive: true,
    createdAt: '2026-07-14T09:00:00.000Z',
    viewCount: 128,
    formUrl: 'https://forms.google.com/example-summer-seminar',
  },
  {
    id: 'preview-file-002',
    eventTitle: '장학금 선발 결과',
    eventType: 'FILE',
    isActive: true,
    createdAt: '2026-07-10T09:00:00.000Z',
    viewCount: 94,
  },
  {
    id: 'preview-form-003',
    eventTitle: '프로젝트 멘토링 신청',
    eventType: 'FORM',
    isActive: false,
    createdAt: '2026-07-02T09:00:00.000Z',
    viewCount: 63,
    formUrl: 'https://forms.google.com/example-mentoring',
  },
  {
    id: 'preview-file-004',
    eventTitle: '콘퍼런스 참가자 안내',
    eventType: 'FILE',
    isActive: true,
    createdAt: '2026-06-28T09:00:00.000Z',
    viewCount: 211,
  },
  {
    id: 'preview-form-005',
    eventTitle: '스터디 그룹 모집',
    eventType: 'FORM',
    isActive: true,
    createdAt: '2026-06-20T09:00:00.000Z',
    viewCount: 47,
    formUrl: 'https://forms.google.com/example-study-group',
  },
  {
    id: 'preview-file-006',
    eventTitle: '워크숍 최종 선발자',
    eventType: 'FILE',
    isActive: false,
    createdAt: '2026-06-12T09:00:00.000Z',
    viewCount: 176,
  },
]

// 파일 변경 화면 확인용 FILE 이벤트 상세. 실제 API 처럼 { success, data } 로 감싼다.
const previewFileDetails = {
  'preview-file-002': {
    count: 248,
    searchColumns: ['이름', '학번'],
    displayColumns: ['합격 여부'],
  },
  'preview-file-004': {
    count: 1032,
    searchColumns: ['이름', '연락처', '소속'],
    displayColumns: [],
  },
  'preview-file-006': {
    count: 37,
    searchColumns: ['이름', '수험번호'],
    displayColumns: ['결과', '안내 사항'],
  },
}

const getPreviewFileDetail = (eventId) => {
  const event = previewEvents.find((item) => item.id === eventId)
  const detail = previewFileDetails[eventId]
  if (!event || !detail) return null

  return {
    success: true,
    data: { ...event, ...detail, searchColumns: [...detail.searchColumns], displayColumns: [...detail.displayColumns] },
  }
}

export const getLocalPreviewPrivateGet = (url) => {
  if (url === '/user') {
    return Promise.resolve({ ...previewUser })
  }

  if (url === '/v1/events') {
    return Promise.resolve({
      count: previewEvents.length,
      events: previewEvents.map((event) => ({ ...event })),
    })
  }

  const fileDetail = getPreviewFileDetail(url.replace('/v1/events/', ''))
  if (url.startsWith('/v1/events/') && fileDetail) {
    return Promise.resolve(fileDetail)
  }

  return Promise.reject(new Error(`로컬 미리보기 응답이 없는 요청입니다: ${url}`))
}
