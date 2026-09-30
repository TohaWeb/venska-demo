import {_utils} from "../utils/_utils.js";

// "What is your goal?" — each tab swaps the recommended course in the panel
const goals = [
    {name: 'Body Sculpt', img: 'assets/img/cryo.jpg', desc: 'Кріоліполіз + LPG-масаж + ендосфера. Руйнуємо локальні жирові пастки і виводимо їх лімфою.', stats: [['10', 'процедур у курсі'], ['5', 'тижнів курсу'], ['−6', "см в об'ємах*"]]},
    {name: 'Smooth Skin', img: 'assets/img/lpg.jpg', desc: 'LPG-масаж + ендосфера. Вирівнюємо рельєф шкіри, покращуємо мікроциркуляцію та тонус.', stats: [['12', 'процедур у курсі'], ['6', 'тижнів курсу'], ['2×', 'пружніша шкіра*']]},
    {name: 'Tone & Shape', img: 'assets/img/ems.jpg', desc: 'EMS-моделювання + LPG-масаж. Тонус м’язів, рельєф і підтягнутий силует без виснажливих тренувань.', stats: [['8', 'процедур у курсі'], ['4', 'тижні курсу'], ['+', 'тонус з перших сеансів']]},
    {name: 'Після пологів', img: 'assets/img/robe.jpg', desc: 'EMS + LPG-масаж + ендосфера. М’яко повертаємо тонус живота, пружність шкіри та легкість.', stats: [['10', 'процедур у курсі'], ['5', 'тижнів курсу'], ['1', 'релакс-масаж у подарунок']]},
    {name: '«Сьоме небо»', img: 'assets/img/ritual-light.jpg', desc: 'Авторський SPA-ритуал: пілінг, обгортання і масаж з теплими оліями. Повне перезавантаження.', stats: [['120', 'хвилин тільки для себе'], ['3', 'етапи ритуалу'], ['0', 'думок про справи']]},
    {name: 'Smooth & Free', img: 'assets/img/laser.jpg', desc: 'Лазерна епіляція курсом: з кожною процедурою волосся тоншає і стає майже непомітним.', stats: [['6–8', 'процедур у курсі'], ['4–6', 'тижнів між сеансами'], ['0', 'щоденного гоління']]},
];

// keep hyphenated terms on one line
const noWrap = (t) => t.replace(/(LPG-масаж|SPA-ритуал)/g, '<span class="nw">$1</span>');

export const goal = () => {
    return new Promise((resolve) => {
        _utils.initSection('.goal', (section) => init(section));
        resolve();
    })
}

const init = (section) => {
    const panel = section.querySelector('.goal__panel');
    const tabs = [...section.querySelectorAll('.goal__tab')];
    if (!panel || !tabs.length) return;

    // warm the cache so switching tabs never waits for a photo
    goals.forEach((g) => { const i = new Image(); i.src = g.img; });

    let timer;
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            if (tab.classList.contains('is-active')) return;
            tabs.forEach((t) => {
                t.classList.toggle('is-active', t === tab);
                t.setAttribute('aria-selected', String(t === tab));
            });

            const g = goals[+tab.dataset.goal];
            panel.classList.add('is-switching');
            clearTimeout(timer);
            timer = setTimeout(() => {
                panel.querySelector('.goal__name').textContent = g.name;
                panel.querySelector('.goal__desc').innerHTML = noWrap(g.desc);
                panel.querySelector('.goal__img img').src = g.img;
                panel.querySelectorAll('.goal__list li').forEach((li, i) => {
                    li.querySelector('b').textContent = g.stats[i][0];
                    li.querySelector('span').textContent = g.stats[i][1];
                });
                panel.classList.remove('is-switching');
            }, 380);
        });
    });
}
