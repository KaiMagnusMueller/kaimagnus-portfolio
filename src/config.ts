import type { SocialObjects } from './types';

export const SITE = {
    // website: 'https://www.kaimagnus.de/',
    author: 'Kai Magnus Müller',
    desc: 'Professional projects and other works of Kai Magnus Müller, interaction designer and hobby developer',
    title: 'Kai Magnus Müller, Interaction Designer',
    titleShort: 'Kai Magnus',
    ogImage: '',
    lightAndDarkMode: true,
};

export const SOCIALS: SocialObjects = [
    {
        name: 'Github',
        href: 'https://github.com/kaimagnusmueller',
        linkTitle: ` ${SITE.title} on Github`,
        active: true,
    },
];
