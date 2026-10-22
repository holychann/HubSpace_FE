// 영상의 현재 프레임으로 세 단계 막대가 얼마나 찼는지(0~1)와 지금 단계의 순서를 구한다.
// boundaries 는 단계가 바뀌는 프레임, lastFrame 은 영상의 마지막 프레임이다.
export function getStepProgress(frame, boundaries, lastFrame) {
  const starts = [0, ...boundaries]
  const ends = [...boundaries, lastFrame]
  const fills = ends.map((end, index) => {
    const start = starts[index]
    return Math.min(Math.max((frame - start) / (end - start), 0), 1)
  })
  const current = fills.findIndex((fill) => fill < 1)
  return { fills, current: current === -1 ? fills.length - 1 : current }
}

// 단계마다 영상에서 차지하는 프레임 수. 막대 폭을 이 비율로 나누면 모든 막대가 같은 속도로 찬다.
export function getStepWeights(boundaries, lastFrame) {
  const edges = [0, ...boundaries, lastFrame]
  return edges.slice(1).map((end, index) => end - edges[index])
}
