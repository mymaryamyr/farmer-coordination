import classes from './Info.module.css';

const Info = (props) => {
    return (
        <div className={classes.info}>
            {props.children}
        </div>
    )
}

export default Info;