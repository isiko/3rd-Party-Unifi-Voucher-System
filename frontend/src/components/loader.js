import Loader from "react-loader-spinner";

const LoadingIndicator = ()=>{
    return(
        <div>
            <h2>Loading...</h2>
            <Loader
                type="TailSpin"
                color="var(--accent-color)"
                height={70}
                width={70}
            />
        </div>
    );
}
export default LoadingIndicator;