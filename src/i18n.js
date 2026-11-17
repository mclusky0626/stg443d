import { createContext, useContext } from 'react';

export const LocaleContext = createContext('en');
const ko = {
  '2 · Retaining pin': '2 · 고정핀', 'Holds the rifle together': '소총의 부품을 연결',
  'Springs off downward': '아래로 당겨 분리', '1 · Magazine': '1 · 탄창',
  'Out first, chamber checked': '먼저 분리하고 약실 확인', '4 · Trigger housing': '4 · 방아쇠 하우징',
  'Swings down on its hinge': '경첩을 중심으로 아래로 열림', 'Tangent, V-notch': '탄젠트식 · V자 홈',
  'Three cartridges, drawn to the same scale': '같은 축척으로 비교한 세 가지 탄약',
  'Safety off, selector at E, a full magazine fitted.': '안전장치 해제, 조정간 E(단발), 탄창 장착 상태입니다.',
  'Safe. The trigger is blocked.': '안전 상태입니다. 방아쇠가 잠겨 있습니다.',
  'No magazine. The hammer falls on an empty chamber.': '탄창이 없습니다. 빈 약실에서 해머만 작동합니다.',
  'Three rounds in a third of a second. Held down, it would empty the magazine in about three seconds.': '약 0.3초 동안 3발을 발사합니다. 계속 누르면 약 3초 만에 탄창이 비워집니다.',
  'One shot. The trigger has to be let go before the next.': '한 발을 발사합니다. 다음 발을 쏘려면 방아쇠를 놓았다가 다시 당겨야 합니다.',
  'With no magazine the bolt closes on an empty chamber.': '탄창이 없어 노리쇠가 빈 약실을 닫습니다.',
  'Handle back and let go: the bolt takes a round off the magazine and locks.': '손잡이를 당겼다 놓으면 노리쇠가 탄창에서 탄을 밀어 넣고 잠깁니다.',
  'Magazine in, rocked up until the catch clicks.': '멈치가 걸릴 때까지 탄창을 밀어 장착했습니다.',
  'Catch pressed. The magazine draws straight out.': '멈치를 눌렀습니다. 탄창이 아래로 빠져나옵니다.',
  'Lever up: safe.': '레버를 올렸습니다. 안전 상태입니다.',
  'Lever down: ready to fire.': '레버를 내렸습니다. 사격 준비 상태입니다.',
  'E stands proud on the left: single shots.': '왼쪽에 E가 돌출되었습니다. 단발 사격입니다.',
  'Pushed through to D: automatic fire.': '조정간을 D로 밀었습니다. 자동 사격입니다.',
  'The slider runs up the ramp and lifts the leaf.': '슬라이더가 경사면을 올라가며 가늠자판을 들어 올립니다.',
  'Safety': '안전장치', 'Safe': '안전', 'Fire': '사격', 'Selector': '조정간',
  'Fire selector': '사격 조정간', 'Single': '단발', 'Automatic': '연사',
  'Rear sight': '가늠자', 'Cock it': '장전손잡이 당기기', 'Squeeze the trigger': '방아쇠 당기기',
  'Fit the magazine': '탄창 장착', 'Release the magazine': '탄창 분리',
  'Interactive 3D model of a Sturmgewehr 44 rifle. Drag to turn it.': '드래그해 회전할 수 있는 슈투름게베어 44 소총의 3D 모델.',
  'A Sturmgewehr 44 seen from the front right': '오른쪽 앞에서 바라본 슈투름게베어 44',
  'Chapters': '목차', 'Scroll to walk round it': '스크롤하며 살펴보세요', 'Drag to turn it': '드래그해 돌려보세요',
  'Assembled': '조립', 'Stripped': '분해', 'Field strip the rifle': '소총 분해 정도',
  'Back to the start': '처음으로 돌아가기', 'Loading the model': '3D 모델을 불러오는 중',
  'This browser could not start WebGL, so the rifle is shown as a still. Everything written here is complete.': '3D 모델을 표시할 수 없어 정지 이미지로 보여드립니다. 본문은 그대로 읽을 수 있습니다.',
  'Playing · scroll to stop': '자동 재생 중 · 스크롤하면 멈춥니다',
  'Magazine housing': '탄창 삽입부', 'Pressed into the receiver': '총몸과 일체로 프레스 가공',
  'Feed lips': '급탄립', 'Rounds leave from alternate sides': '좌우에서 번갈아 급탄',
  '30 rounds': '30발', 'Two staggered columns': '엇갈린 복열 배열',
  'Floor plate': '탄창 바닥판', 'Slides off for cleaning': '밀어 분리하여 청소',
  'Gas block': '가스 블록', 'Taps the barrel 25 cm from the breech': '약실에서 25 cm 지점에서 가스 추출',
  'Gas piston': '가스 피스톤', 'One piece with the carrier': '노리쇠뭉치와 일체형',
  'Bolt carrier': '노리쇠뭉치', 'Runs back about 10 cm': '약 10 cm 후퇴',
  'Bolt': '노리쇠', 'Tilts to lock in the receiver': '기울어져 총몸에 잠금',
  'Barrel': '총열', '419 mm, four grooves': '419 mm · 강선 4조',
  'Return spring': '복좌용수철', 'Housed inside the butt': '개머리판 내부에 수납',
  'Gas plug': '가스 플러그', 'Unscrews to clean the cylinder': '풀어서 실린더 청소',
  'Handguard': '총열덮개', 'One folded steel pressing': '강판 한 장을 접어 프레스 가공',
  'Receiver': '총몸', 'Two pressings, welded': '프레스 부품 두 개를 용접',
  'Machined, as it has to be': '강도를 위해 절삭 가공',
  'Vent slots': '방열구', 'It still ran hot on automatic': '연사 시에는 여전히 과열',
  'Stiffening ribs': '보강 리브', 'Pressed in, not machined': '절삭 대신 프레스 성형',
  '100 to 800 m': '100–800 m', 'Cocking handle': '장전손잡이', 'Moves with the bolt': '노리쇠와 함께 이동',
  'E single shots · D automatic': 'E 단발 · D 연사', 'Magazine catch': '탄창 멈치', 'Press to release': '눌러서 분리',
  'Trigger': '방아쇠', 'Up safe · down fire': '위로 안전 · 아래로 사격',
  'Sling': '멜빵', '5 · Bolt carrier': '5 · 노리쇠뭉치', 'Out through the rear': '총몸 뒤쪽으로 분리',
  '6 · Bolt': '6 · 노리쇠', 'Lifts off the carrier': '노리쇠뭉치에서 들어 분리',
  '3 · Butt': '3 · 개머리판', 'With the return spring': '복좌용수철과 함께 분리',
  'Gas cylinder': '가스 실린더', 'Above the barrel': '총열 위에 배치',
  'Front sight': '가늠쇠', 'Hooded post': '보호덮개가 있는 기둥형',
  'Port cover': '배출구 덮개', 'Springs open as the bolt moves': '노리쇠가 움직이면 열림',
  'Butt': '개머리판', 'In line with the bore': '총열 중심선과 일직선',
  'Muzzle': '총구', 'Pressed steel': '프레스 강판', 'Magazine': '탄창',
  'Pistol grip': '권총형 손잡이', 'Wood or plastic panels': '목재 또는 플라스틱 패널',
  'Leather': '가죽', 'Overall length': '전체 길이', 'Bore axis': '총열 중심선',
};
export function useTranslation() {
  const locale = useContext(LocaleContext);
  return (text) => locale === 'ko' ? (ko[text] ?? text) : text;
}
export function initialLocale() {
  const requested = new URLSearchParams(window.location.search).get('lang');
  if (requested === 'ko' || requested === 'en') return requested;
  try {
    const saved = localStorage.getItem('stg44-language');
    if (saved === 'ko' || saved === 'en') return saved;
  } catch { /* The site also works with storage disabled. */ }
  return navigator.language?.startsWith('ko') ? 'ko' : 'en';
}
