import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/login.css";

function Login() {

    const navigate = useNavigate();

    const [formData,setFormData]=useState({
        user_id:"",
        device_id:"",
        city:"",
        country:"",
        ip_address:"",
    });

    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    };

    const handleLogin=async(e)=>{
        e.preventDefault();

        try{

            const response = await API.post("/login", formData);

            navigate("/dashboard", {
                state: response.data
            });

        }
        catch(err){

            alert("Login Failed");

        }
    };

    return(

<div className="login-page">

<div className="login-card">

<div className="text-center">

<i className="bi bi-shield-lock-fill logo-icon"></i>

</div>

<h2 className="login-title">

Dynamic Risk Adaptive Access Control

</h2>

<p className="login-subtitle">

AI-Powered Zero Trust Security Platform

</p>

<form onSubmit={handleLogin}>

<input
className="form-control mb-3"
placeholder="User ID"
name="user_id"
onChange={handleChange}
/>

<input
className="form-control mb-3"
placeholder="Device ID"
name="device_id"
onChange={handleChange}
/>

<input
className="form-control mb-3"
placeholder="City"
name="city"
onChange={handleChange}
/>

<input
className="form-control mb-3"
placeholder="Country"
name="country"
onChange={handleChange}
/>

<input
className="form-control mb-4"
placeholder="IP Address"
name="ip_address"
onChange={handleChange}
/>

<button
className="btn btn-primary login-btn"
type="submit">

<i className="bi bi-box-arrow-in-right me-2"></i>

Secure Login

</button>

</form>

</div>

</div>

    );

}

export default Login;