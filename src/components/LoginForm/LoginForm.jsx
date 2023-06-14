import {Link, useNavigate} from "react-router-dom";
import {bannerPageButtonClass} from "../styles.js";
import LogoBanner from '../../assets/logo/logo-banner.png'
import {useState} from "react";
import {InputField, PasswordField} from "../";
import {useDispatch} from "react-redux";
import {login} from "../../redux/authSlice/authSlice.js";

export const LoginForm = () => {
    const [values, setValues] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});

    const dispatcher = useDispatch()
    const navigator = useNavigate()

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!(validateEmail(values.email) && validatePassword(values.password))){
            return
        }

        //TODO: Add login logic here
        if (values.email === values.password){
            const user = {
                email: values.email,
                name: 'John Doe',
                id: 1,
                profilePicture: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
            }
            dispatcher(login(user))
            navigator('/')
        }
        else{
            setErrors(prev => ({...prev, password: 'Password is incorrect..'}));
        }

    }

    const validateEmail = (value) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;

        if (regex.test(value)){
            setErrors(prev => ({...prev, email: ''}));
            return true;
        }
        else if (value.trim() === ''){
            setErrors(prev => ({...prev, email: 'Email can\'t be empty..'}));
            return false;
        }
        else{
            setErrors(prev => ({...prev, email: 'Email is not valid..'}));
            return false;
        }
    }

    const validatePassword = (value) => {
        if (value.trim() === ''){
            setErrors(prev => ({...prev, password: 'Password can\'t be empty..'}));
            return false;
        }
        else{
            setErrors(prev => ({...prev, password: ''}));
            return true;
        }
    }

    const updateEmail = (event) => {
        validateEmail(event.target.value);
        setValues(prev => ({...prev, email: event.target.value}));
    }

    const updatePassword = (event) => {
        validatePassword(event.target.value);
        setValues(prev => ({...prev, password: event.target.value}));
    }

    return (
        <section className={'w-full md:w-2/4 flex flex-col justify-center items-center gap-2.5 p-2 md:p-8'}>
            <div className={'w-3/4'}>
                <img src={LogoBanner} className={'object-cover'} alt={'Logo'}/>
            </div>
            <h3 className={'font-semibold'}>Login to your Account</h3>
            <form className={'flex flex-col items-center gap-2.5 w-3/4'}>
                <InputField type={'email'} placeholder={'Email'} value={values.email}
                            onChange={updateEmail}/>
                {errors.email && <ul>
                    <li className={'text-dangerColor font-serif text-xs'}>{errors.email}</li>
                </ul>}
                <PasswordField value={values.password} onChange={updatePassword}
                               placeholder={'Password'}/>
                {errors.password && <ul>
                    <li className={'text-dangerColor font-serif text-xs'}>{errors.password}</li>
                </ul>}
                <button
                    className={bannerPageButtonClass}
                    onClick={handleSubmit}
                >Login
                </button>
                <Link className={'italic'} to={'/register/'}>New here? Click here</Link>
            </form>
        </section>
    )
}