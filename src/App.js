import './App.css';
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import React, { useRef, useEffect, useState } from 'react';
import mapClasses from './UI/MapContainer.module.css';
import inputClasses from './UI/Input.module.css';
import useInput from './hooks/use-input';
import Button from './UI/Button';
import Info from './UI/Info';



function App() {
  // input data
  const [submitLoading, seSubmitLoading] = useState(false)
  const [didSubmit, setDidSubmit] = useState(false)
  const [tryAgain, setTryAgain] = useState(false)
  const notEmpty = (value => value.length > 0)

  const {
    input: name,
    inputIsValid: nameIsValid,
    inputHasError: nameHasError,
    inputChange: nameChange,
    inputBlur: nameBlur,
    reset: resetName
  } = useInput(notEmpty)

  const {
    input: date,
    inputIsValid: dateIsValid,
    inputHasError: dateHasError,
    inputChange: dateChange,
    inputBlur: dateBlur,
    reset: resetDate
  } = useInput(notEmpty)

  //map
  const mapContainer = useRef(null);
  const [coordinates, setCoordinates] = useState(null)
  const [coordinatesHasError, setCoordinatesHasError] = useState(false)

  mapboxgl.accessToken = 'pk.eyJ1IjoibXltYXJ5YW15ciIsImEiOiJja3cxb3ZwbmgwdzJsMzByb2FjYWIxYnR2In0.MURVRfCGZSjUP08WOTzqMA';

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [53.6880, 32.4279],
      zoom: 4
    });
    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      // mapbox-gl-draw control buttons
      controls: {
        polygon: true,
        trash: true
      },
      // Set mapbox-gl-draw to draw by default.
      defaultMode: 'draw_polygon'
    });
    map.addControl(draw);

    map.on('draw.create', function (e) {
      var x = draw.getAll();
      setCoordinates(x['features'][0]['geometry']['coordinates'][0])
    });

    // Clean up on unmount
    return () => map.remove();

  }, [setCoordinates]);

  const submitOnFirebase = (userData) => {
    seSubmitLoading(true)

    fetch("https://react-http-a0ffe-default-rtdb.firebaseio.com/keshtyaar.json", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'name': userData.name, 'date': userData.date, coordinates: userData.coordinates }),
    })
      .then(res => res.json())
      .then(
        () => {
          seSubmitLoading(false)
          setDidSubmit(true)
        },
        (error) => {
          seSubmitLoading(false)
          setTryAgain(true)
        }
      )
      .catch(error => {
        console.error('Error:', error)
      })

  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (coordinates && nameIsValid && dateIsValid) {
      submitOnFirebase({ name, date, coordinates })

      resetName()
      resetDate()
    } else {
      nameBlur()
      dateBlur()
      if (!coordinates) {
        setCoordinatesHasError(true)
      }
      return
    }
  }
  const isSubmittingForm = <Info><p>درحال ثبت درخواست ... </p></Info>

  const submitedForm = (
    <Info>
      <p>درخواست شما با موفقیت ثبت شد</p>
      <div>
        <Button type="button" onClick={() => window.location.reload(false)}>شروع دوباره</Button>
      </div>
    </Info>
  )

  const formContent = (
    <form onSubmit={handleSubmit} className={inputClasses.form}>
      <h1 className="title--big">به کشتیار خوش آمدید!</h1>
      <p className="default__p">سلام! برای دریافت مشاوره لطفا مشخصات زمین کشاورزی خود را وارد کنید.</p>
      <div className={inputClasses.input__block}>
        <div className={`${inputClasses.form_group} ${nameHasError && 'invalid'}`}>
          <label htmlFor="name" className={inputClasses.control_label}>نام محصول</label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={nameChange}
            onBlur={nameBlur}
            className={inputClasses.form_control}
          />
          {nameHasError && <p className={inputClasses.error}>زمان کاشت نمی‌تواند خالی باشد</p>}
        </div>
        <div className={`${inputClasses.form_group} ${dateHasError && 'invalid'}`}>
          <label htmlFor="date" className={inputClasses.control_label}>زمان کاشت</label>
          <input
            type="date"
            name="date"
            value={date}
            onChange={dateChange}
            onBlur={dateBlur}
            className={inputClasses.form_control}
          />
          {dateHasError && <p className={inputClasses.error}>نام محصول نمی‌تواند خالی باشد</p>}
        </div>
      </div>
      <div className={`${mapClasses.map__block} ${coordinatesHasError && 'invalid'}`}>
        <div className={mapClasses.description}>
          <p>برای رسم محدوده کشاورزی خود، روی نقشه کلیک کنید.</p>
        </div>
        <div ref={mapContainer} className={mapClasses.mapContainer}>
        </div>
        {coordinatesHasError && <p className={mapClasses.error}>لطفا محدوده زمین خود را مشخص کنید</p>}
      </div>
      <Button type="submit">ثبت اطلاعات</Button>
    </form>
  )

  const trySubmittingAgain = (
    <Info>
      <p>در مرحله ثبت خطایی رخ داده است. لطفا دوباره تلاش کنید.</p>
      <div>
        <Button type="button" onClick={() => window.location.reload(false)}>تلاش دوباره</Button>
      </div>
    </Info>
  )

  return (
    <div className="App">

      {submitLoading && isSubmittingForm}
      {!submitLoading && didSubmit && submitedForm}
      {!submitLoading && !didSubmit && !tryAgain && formContent}
      {tryAgain && trySubmittingAgain}

    </div>
  );

}

export default App;
