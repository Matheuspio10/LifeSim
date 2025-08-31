import React from 'react';

const iconProps = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  className: "w-full h-full"
};

export const AcademicCapIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
);

export const ArrowTrendingDownIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6 9 12.75l4.286-4.286a11.948 11.948 0 0 1 4.306 6.43l.776 2.898m0 0 3.182-5.511m-3.182 5.51-5.511-3.181" />
    </svg>
);

export const ArrowTrendingUpIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25l8.25 8.25 8.25-8.25" transform="rotate(-45 12 12)"/>
    </svg>
);

export const ArrowUturnLeftIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

export const BeakerIcon = () => (
    <svg {...iconProps} strokeWidth={1.5} viewBox="0 0 24 24" fill="none">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 21v-4.5m13.5 4.5v-4.5m-13.5 0L7.5 3.75h9l2.25 12.75M5.25 16.5h13.5" />
    </svg>
);

export const BookOpenIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
);

export const BrainIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.75c0 .966.354 1.86.938 2.553a3.75 3.75 0 1 0 4.124 0A3.75 3.75 0 0 0 15.5 12.75c0-.966-.354-1.86-.938-2.553a3.75 3.75 0 0 0-4.124 0A3.75 3.75 0 0 0 9.5 12.75ZM3 11.25a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v.093c.338.114.66.27.968.463.308.192.604.42.886.682a5.25 5.25 0 0 1 5.234 0c.282-.262.578-.49.886-.682.308-.193.63-.349.968-.463v-.093a2.25 2.25 0 0 1 2.25-2.25h1.5a2.25 2.25 0 0 1 2.25 2.25v3.75a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-.093a6.01 6.01 0 0 0-.968-.463c-.308-.192-.604-.42-.886-.682a5.25 5.25 0 0 0-5.234 0c-.282.262-.578-.49-.886.682-.308.193-.63.349-.968.463v.093a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-3.75Z" />
    </svg>
);

export const BriefcaseIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.05a2.25 2.25 0 0 1-2.25 2.25h-10.5a2.25 2.25 0 0 1-2.25-2.25v-4.05m15-4.5-3-3m0 0-3 3m3-3v12" />
    </svg>
);

export const ChartBarIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
);

export const ChartPieIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 10.5 3v7.5Z" />
    </svg>
);

export const CheckCircleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const ClipboardDocumentListIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-.668-.285-1.259-.75-1.685l-3.992-2.994a1.875 1.875 0 0 0-2.25 0l-3.992 2.994c-.465.426-.75 1.017-.75 1.685v10.536A2.25 2.25 0 0 0 6.75 21h9a2.25 2.25 0 0 0 2.25-2.25Z" />
    </svg>
);

export const CloudIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-5.132-3.712 5.25 5.25 0 0 0-9.739 3.543 4.5 4.5 0 0 0-1.332 7.257Z" />
    </svg>
);

export const Cog6ToothIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.008 1.11-1.226.55-.218 1.192-.218 1.742 0 .55.218 1.02.684 1.11 1.226l.08 1.342c.264.043.521.1.772.177.25.077.493.17.726.282l1.248-.512a1.5 1.5 0 0 1 1.666 1.958l-.332 1.332c-.07.282-.12.57-.183.856-.062.286-.14.564-.233.832l.98 1.044c.362.384.444.95.21 1.412a1.5 1.5 0 0 1-1.272.83l-1.332.332c-.286.07-.57.12-.856.183-.286.062-.564.14-.832.233l-1.044.98c-.384.362-.95.444-1.412.21a1.5 1.5 0 0 1-.83-1.272l-.332-1.332c-.07-.286-.12-.57-.183-.856-.062-.286-.14-.564-.233-.832l-.98-1.044a1.5 1.5 0 0 1 .21-2.072l.98-1.044c.093-.268.17-.546.233-.832.062-.286.112-.574.183-.856l.332-1.332a1.5 1.5 0 0 1 1.958-1.666l1.248.512c.233.112.476.205.726.282.25.077.508.134.772.177l.08-1.342zM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5z" />
    </svg>
);

export const CrownIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 8.25L12 5.25 8.25 8.25M12 5.25v12.75" transform="rotate(45 12 12)"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m12 3.75 4.243 4.243-4.243 4.243-4.243-4.243L12 3.75Z"/>
    </svg>
);

export const CurrencyDollarIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const DocumentTextIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

export const EnvelopeIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

export const ExclamationTriangleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

export const FaceFrownIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.818A4.5 4.5 0 0 1 12 15a4.5 4.5 0 0 1-3.182 1.818M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.75h.008v.008H9V9.75Zm6 0h.008v.008h-.008V9.75Z" />
    </svg>
);

export const FaceSmileIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9 9.75h.008v.008H9V9.75Zm6 0h.008v.008h-.008V9.75Z" />
    </svg>
);

export const FireIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.217 8.217 0 0 1 3 2.48Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 3.75 3.75 0 0 0-1.993-2.118 3.75 3.75 0 0 0-4.114 1.176 3.75 3.75 0 0 0 .166 4.963 3.75 3.75 0 0 0 1.993 2.118 3.75 3.75 0 0 0 3.468-1.118Z" />
    </svg>
);

export const GlobeAltIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-.778.099-1.533.284-2.253" />
    </svg>
);

export const HandThumbUpIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558-.587 1.08-.94 1.56M6.633 10.25l-2.286-6.857a.75.75 0 0 0-1.425.474l2.286 6.857 1.425-.474ZM6.633 10.25a2.25 2.25 0 0 1-2.25 2.25h-2.25a2.25 2.25 0 0 1-2.25-2.25V7.5a2.25 2.25 0 0 1 2.25-2.25h2.25a2.25 2.25 0 0 1 2.25 2.25v2.75Z" />
    </svg>
);

export const HeartIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
);

export const HeartPulseIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25-1.5 8.25 3 12.75l3-4.5 3 4.5 3-4.5 3 4.5-4.5-4.5L12 8.25Z" transform="scale(1.5) translate(-4 -4)"/>
    </svg>
);

export const HomeIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
);

export const LightBulbIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c.411.023.824.036 1.25.036h5c.426 0 .839-.013 1.25-.036ZM12 3v1.875m0 0a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Zm0 0h.008v.008H12V4.875Z" />
    </svg>
);

export const LionIcon = () => (
    <svg {...iconProps} strokeWidth={2}>
        <path d="M12 2c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zm-2 6h4m-2 2v2m-2 2h4m-4 2h4m-6 2h8a2 2 0 0 1 2 2v2H4v-2a2 2 0 0 1 2-2z" />
    </svg>
);

export const LockClosedIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

export const MapPinIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

export const MinusCircleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const MinusIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
);

export const MusicalNoteIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-2.25 2.25h-1.5a2.25 2.25 0 0 1-2.25-2.25v-3.75m0-6.553 2.25-2.25a2.25 2.25 0 0 1 3 3l-2.25 2.25m0-6.553-2.25 2.25m2.25-2.25 2.25 2.25" />
    </svg>
);

export const PaintBrushIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15.828 7.172-5.656 5.657-1.414-1.414 5.656-5.657 1.414 1.414ZM12 9.414l-2.121-2.121M3.5 17.5l-1-1 4.242-4.243 1 1-4.242 4.243Z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 14.5l-6 6M12.5 11.5l-6 6" />
    </svg>
);

export const PencilSquareIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

export const PhotoIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

export const PixelArtPortraitIcon: React.FC<{ hairColor: string; eyeColor: string }> = ({ hairColor, eyeColor }) => (
    <svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}>
        <rect x="6" y="8" width="12" height="10" fill="#e0ac69" />
        <rect x="4" y="4" width="16" height="4" fill={hairColor} />
        <rect x="4" y="8" width="2" height="6" fill={hairColor} />
        <rect x="18" y="8" width="2" height="6" fill={hairColor} />
        <rect x="6" y="18" width="12" height="2" fill="#583523" />
        <rect x="8" y="12" width="2" height="2" fill={eyeColor} />
        <rect x="14" y="12" width="2" height="2" fill={eyeColor} />
    </svg>
);

export const PlusCircleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

export const PuzzlePieceIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.75a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-2.251a25.414 25.414 0 0 0-5.408 3.813.75.75 0 0 1-1.06 0 25.414 25.414 0 0 0-5.408-3.813V10.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5H5.25v2.251c1.78.932 3.626 2.053 5.383 3.327.35.256.74.256 1.091 0 1.757-1.274 3.603-2.395 5.383-3.327V6.75h-2.25a.75.75 0 0 1-.75-.75Z" />
    </svg>
);

export const ScaleIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-19.5 0c.99-.203 1.99-.377 3-.52M6.75 7.5h10.5M6.75 7.5a2.25 2.25 0 0 1-2.25-2.25V4.5a2.25 2.25 0 0 1 2.25-2.25h10.5a2.25 2.25 0 0 1 2.25 2.25v.75a2.25 2.25 0 0 1-2.25 2.25M6.75 7.5v-1.875a.375.375 0 0 1 .375-.375h10.125a.375.375 0 0 1 .375.375V7.5" />
    </svg>
);

export const ShieldCheckIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.745 3.745 0 0 1 3.296-1.043A3.745 3.745 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
    </svg>
);

export const ShieldExclamationIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036c.465.088.92.224 1.348.42pM9 12.75 11.25 15 15 9.75m-3.75-3.75c-.428-.196-.883-.332-1.348-.42m0 0a10.96 10.96 0 0 0-3.328 1.48A10.96 10.96 0 0 0 3 13.5v.75c0 1.253.336 2.45 1.002 3.526A10.96 10.96 0 0 0 12 21a10.96 10.96 0 0 0 7.998-3.224A10.96 10.96 0 0 0 21 14.25v-.75a10.96 10.96 0 0 0-2.672-6.52A10.96 10.96 0 0 0 12 3.464Zm0 12.036h.008v.008H12v-.008Z" />
    </svg>
);

export const SparklesIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.452-2.452L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.452-2.452L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.452 2.452L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.452 2.452ZM6.47 16.5c-.334.334-.654.682-.962 1.038L2.25 21l2.428-2.428.016.016.016-.016a3.375 3.375 0 0 0 1.038-.962L6.47 16.5Z" />
    </svg>
);

export const SpeakerWaveIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 11.233a.75.75 0 0 1 0 1.534 8.25 8.25 0 0 1-8.25 8.25.75.75 0 0 1 0-1.534 6.75 6.75 0 0 0 6.75-6.75.75.75 0 0 1 1.5 0ZM15.828 11.233a.75.75 0 0 1 0 1.534 4.5 4.5 0 0 1-4.5 4.5.75.75 0 0 1 0-1.534 3 3 0 0 0 3-3 .75.75 0 0 1 1.5 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 11.25a.75.75 0 0 1 0 1.5 1.5 1.5 0 0 1-1.5 1.5.75.75 0 0 1 0-1.5 1.5 1.5 0 0 1 1.5-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.507a3.738 3.738 0 0 0-2.522 1.023L3.15 8.107a.75.75 0 0 0 0 1.061l2.578 2.578A3.738 3.738 0 0 0 8.25 12.75v-8.243Z" />
    </svg>
);

export const StarIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.336 1.003l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .336-1.003l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
    </svg>
);

export const SwordIcon = () => (
    <svg {...iconProps} strokeWidth={2}>
        <path d="M12 2l2 4h-4zM10 8v10h4V8zm-2 12h8v2H8z" />
    </svg>
);

export const TicketIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3M10.5 3H19.5c.621 0 1.125.504 1.125 1.125v14.25c0 .621-.504 1.125-1.125 1.125H10.5c-1.35 0-2.438-1.007-2.617-2.271a25.117 25.117 0 0 1 0-10.958C8.062 4.007 9.15 3 10.5 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 6v.75m0 3v.75m0 3v.75m0 3V18m-3-1.5h.75m-1.5 0h.75m-1.5 0h.75m-.75 0h.75M4.5 3.875c.621 0 1.125.504 1.125 1.125v14.25c0 .621-.504 1.125-1.125 1.125H3.375c-.621 0-1.125-.504-1.125-1.125V5c0-.621.504-1.125 1.125-1.125h1.125Z" />
    </svg>
);

export const TreeIcon = () => (
    <svg {...iconProps} strokeWidth={2}>
        <path d="M12 2c2 0 4 2 4 4s-2 4-4 4-4-2-4-4 2-4 4-4zM10 10v12h4V10z" />
    </svg>
);

export const TrophyIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9 9 0 0 0 9 0Zm0 0a2.25 2.25 0 0 1 2.25 2.25v1.5a2.25 2.25 0 0 1-2.25-2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-1.5A2.25 2.25 0 0 1 7.5 18.75m9-15.75h-9a9 9 0 0 0 9 0ZM7.5 3a2.25 2.25 0 0 1 2.25-2.25h4.5A2.25 2.25 0 0 1 16.5 3v1.5a2.25 2.25 0 0 1-2.25 2.25h-4.5A2.25 2.25 0 0 1 7.5 4.5v-1.5Z" />
    </svg>
);

export const UserCircleIcon = () => (
    <svg {...iconProps} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);


export const UserGroupIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.289 2.72a.75.75 0 0 1-.75-.75A4.5 4.5 0 0 1 12 11.25a4.5 4.5 0 0 1 4.5 4.5.75.75 0 0 1-.75.75m-6-1.5a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15.75a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15.75a.75.75 0 0 0-1.5 0v.75a.75.75 0 0 0 1.5 0v-.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6v1.5a3 3 0 0 0 0 6v-1.5a3 3 0 0 0-3-3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6v1.5a3 3 0 0 0 0 6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c.664 0 1.32.046 1.956.134a4.5 4.5 0 0 1 4.394 4.394c.088.636.134 1.292.134 1.956 0 .664-.046 1.32-.134 1.956a4.5 4.5 0 0 1-4.394 4.394c-.636.088-1.292.134-1.956.134-.664 0-1.32-.046-1.956-.134a4.5 4.5 0 0 1-4.394-4.394c-.088-.636-.134-1.292-.134-1.956 0-.664.046 1.32.134-1.956A4.5 4.5 0 0 1 10.044 2.384c.636-.088 1.292-.134 1.956-.134Z" />
    </svg>
);

export const UsersIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.289 2.72a.75.75 0 0 1-.75-.75A4.5 4.5 0 0 1 12 11.25a4.5 4.5 0 0 1 4.5 4.5.75.75 0 0 1-.75.75m-9-3.75a3 3 0 0 0-3-3v1.5a3 3 0 0 0 3 3v-1.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.75a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6v1.5a3 3 0 0 0 0 6v-1.5a3 3 0 0 0-3-3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75a3 3 0 0 0-3 3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6v1.5a3 3 0 0 0 0 6v-1.5a3 3 0 0 0-3-3v1.5a3 3 0 0 0 3 3v-1.5a3 3 0 0 0 0-6Z" />
    </svg>
);

export const WrenchScrewdriverIcon = () => (
    <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.83-5.83m.025.025.025-.025m0 0-.025.025m-2.225-2.225.025.025m-.025-.025-.025.025m2.225-2.225.025-.025m-.025.025.025.025m-4.5 4.5-.025.025m.025-.025.025-.025m2.225-2.225-.025.025m.025-.025.025-.025m-4.5 4.5.025-.025m-.025.025-.025.025m-2.225-2.225-.025.025m.025-.025-.025.025m2.225-2.225-.025.025m.025-.025L3 12m14.25-9.75L3.75 14.25" />
    </svg>
);
