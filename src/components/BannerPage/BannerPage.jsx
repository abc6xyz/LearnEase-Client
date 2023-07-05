import {LazyImage} from "../UtilityComponents/LazyImage/LazyImage.jsx";

// eslint-disable-next-line react/prop-types
export const BannerPage = ({children, bigBanner, smallBanner, reverse}) => {
    return (<div
        className={
            `bg-secondary flex justify-center align-middle h-screen${reverse ? ' flex-row-reverse' : ' flex-row'}`
        }>
        <section className={'hidden md:flex w-2/4 justify-center'}>
            <LazyImage className={'object-contain w-3/4'} bigSrc={bigBanner} smallSrc={smallBanner} alt={'Banner'}/>
        </section>
        {children}
    </div>)
}