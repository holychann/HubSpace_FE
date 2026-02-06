// 1. CSV + 필드 3개
export const userCsvThreeFields = {
  id: 123456789,
  eventTitle: '2026 미터 - CSV',
  searchColumns: ['이름', '학번', '생년월일'],
  isActive: true,
}

// 2. CSV + 필드 2개
export const userCsvTwoFields = {
  id: 234567891,
  eventTitle: '2026 새터 - CSV',
  searchColumns: ['이름', '학번'],
  isActive: true,
}

// 3: FORM + 필드 3개
export const userFormThreeFields = {
  id: 345678912,
  eventTitle: '2026 엘티 - FORM',
  searchColumns: ['이름', '학번', '전화번호'],
  isActive: true,
}

// 4. FORM + 필드 2개
export const userFormTwoFields = {
  id: 456789123,
  eventTitle: '2026 엠티 - FORM',
  searchColumns: ['이름', '전화번호'],
  isActive: true,
}

// 사용자 dummy DB
const userDummy = [
  // 1
  {
    eventId: 123456789,
    answers: {
      이름: '최지우',
      학번: '2026402001',
      생년월일: '060907',
    },
  },
  {
    eventId: 123456789,
    answers: {
      이름: '카르멘',
      학번: '2026402002',
      생년월일: '060328',
    },
  },
  {
    eventId: 123456789,
    answers: {
      이름: '유하람',
      학번: '2026402003',
      생년월일: '070412',
    },
  },

  // 2
  {
    eventId: 234567891,
    answers: {
      이름: '김나연',
      학번: '2026402008',
    },
  },
  {
    eventId: 234567891,
    answers: {
      이름: '김예온',
      학번: '2026402018',
    },
  },

  // 3
  {
    eventId: 345678912,
    answers: {
      이름: '노유나',
      학번: '2026402006',
      전화번호: '010200812220',
    },
  },
  {
    eventId: 345678912,
    answers: {
      이름: '정이안',
      학번: '2026402007',
      전화번호: '01020091009',
    },
  },

  // 4
  {
    eventId: 456789123,
    answers: {
      이름: '김다현',
      전화번호: '01020070618',
    },
  },
  {
    eventId: 456789123,
    answers: {
      이름: '김주은',
      전화번호: '01020081203',
    },
  },
]

// 사용자 조회 함수 (더미)
export const getUserSearchResult = (userSearchData, eventDetail) => {
  const { searchColumns, id } = eventDetail

  // dummy DB에서 현재 이벤트의 데이터만 검색 (필터링)
  const userFoundData = userDummy
    .filter((userRecord) => userRecord.eventId === Number(id))
    .find((userRecord) => {
      return searchColumns.every((columnName) => {
        return userRecord.answers[columnName] === userSearchData[columnName]
      })
    })

  // 조회 실패
  if (!userFoundData) {
    return {
      isSuccess: false,
      message: '해당 정보로 조회된 기록이 없습니다.',
    }
  }

  // 조회 성공
  return {
    isSuccess: true,
    data: {
      eventId: userFoundData.eventId,
      answers: userFoundData.answers,
    },
  }
}
