import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";

export const UserProfile = () => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);

    const [formData, setFormData] = useState({

        firstName: "",
        lastName: "",
        email: "",
        age: "",
        gender: "",
        profilePic: null
    });

    // GET PROFILE
    const getProfile = async () => {

        try {

            const res = await axiosInstance.get("/user/profile");

            setUser(res.data.data);

            setFormData({

                firstName: res.data.data.firstName || "",
                lastName: res.data.data.lastName || "",
                email: res.data.data.email || "",
                age: res.data.data.age || "",
                gender: res.data.data.gender || "",
                profilePic: null
            });

        } catch (error) {

            console.log(error);

            toast.error("Failed To Load Profile");

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        getProfile();

    }, []);

    // HANDLE INPUT
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({

            ...formData,
            [name]: value
        });
    };

    // HANDLE IMAGE
    const handleImage = (e) => {

        setFormData({

            ...formData,
            profilePic: e.target.files[0]
        });
    };

    // UPDATE PROFILE
    const updateProfile = async () => {

        try {

            // UPDATE DETAILS
            await axiosInstance.put("/user/update-profile",

                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    age: formData.age,
                    gender: formData.gender
                }
            );

            // UPDATE IMAGE
            if (formData.profilePic) {

                const imageData = new FormData();

                imageData.append(
                    "image",
                    formData.profilePic
                );

                await axiosInstance.put(

                    "/user/profilePic",

                    imageData,

                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );
            }

            toast.success("Profile Updated");

            setShowEditModal(false);

            getProfile();

        } catch (error) {

            console.log(error);

            toast.error("Update Failed");
        }
    };

    if (loading) {

        return (

            <div className="min-h-screen bg-slate-950 flex justify-center items-center">

                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>

            </div>
        );
    }

    return (

        <div className="min-h-screen bg-slate-950 py-10 px-4 text-white">

            <div className="max-w-5xl mx-auto">

                {/* PROFILE CARD */}
                <div className="bg-slate-900 rounded-[35px] overflow-hidden border border-slate-800 shadow-2xl">

                    {/* TOP BANNER */}
                    <div className="h-64 bg-gradient-to-r from-indigo-700 via-purple-600 to-indigo-900 relative">

                        <div className="absolute inset-0 bg-black/10"></div>

                    </div>

                    {/* PROFILE CONTENT */}
                    <div className="px-8 pb-10 relative">

                        {/* IMAGE */}
                        <div className="-mt-24 flex flex-col md:flex-row md:items-end gap-6">

                            <div className="relative">

                                <img
                                    src={user?.profilePic}
                                    alt=""
                                    className="w-48 h-48 rounded-full border-[6px] border-slate-900 object-cover shadow-2xl"
                                />

                                <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-green-500 border-4 border-slate-900"></div>

                            </div>

                            {/* USER INFO */}
                            <div className="flex-1">

                                <h1 className="text-5xl font-black tracking-tight">

                                    {user?.firstName} {user?.lastName}

                                </h1>

                                <p className="text-indigo-300 mt-3 text-lg">

                                    {user?.email}

                                </p>

                            </div>

                            {/* EDIT BUTTON */}
                            <button

                                onClick={() => setShowEditModal(true)}

                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-all duration-300 px-7 py-4 rounded-2xl font-bold shadow-xl"
                            >
                                ✏️ Edit Profile
                            </button>

                        </div>

                        {/* DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">

                            {/* LEFT */}
                            <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700">

                                <h2 className="text-3xl font-bold mb-8">

                                    Personal Information

                                </h2>

                                <div className="space-y-6">

                                    <div>

                                        <p className="text-slate-400 mb-1">

                                            Full Name
                                        </p>

                                        <h3 className="text-2xl font-semibold">

                                            {user?.firstName} {user?.lastName}

                                        </h3>

                                    </div>

                                    <div>

                                        <p className="text-slate-400 mb-1">

                                            Email
                                        </p>

                                        <h3 className="text-xl font-semibold">

                                            {user?.email}

                                        </h3>

                                    </div>

                                </div>

                            </div>

                            {/* RIGHT */}
                            <div className="bg-slate-800/60 p-8 rounded-3xl border border-slate-700">

                                <h2 className="text-3xl font-bold mb-8">

                                    Account Details

                                </h2>

                                <div className="space-y-6">

                                    <div>

                                        <p className="text-slate-400 mb-1">

                                            Age
                                        </p>

                                        <h3 className="text-2xl font-semibold">

                                            {user?.age}
                                        </h3>

                                    </div>

                                    <div>

                                        <p className="text-slate-400 mb-1">

                                            Gender
                                        </p>

                                        <h3 className="text-2xl font-semibold">

                                            {user?.gender}
                                        </h3>

                                    </div>

                                    <div>

                                        <p className="text-slate-400 mb-1">

                                            Joined On
                                        </p>

                                        <h3 className="text-2xl font-semibold">

                                            {
                                                new Date(user?.createdAt)
                                                .toLocaleDateString()
                                            }

                                        </h3>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* EDIT MODAL */}
            {
                showEditModal && (

                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">

                        <div className="bg-slate-900 w-full max-w-2xl rounded-3xl p-8 border border-slate-700 shadow-2xl animate-fadeIn">

                            {/* HEADER */}
                            <div className="flex justify-between items-center mb-8">

                                <h2 className="text-3xl font-bold">

                                    Edit Profile
                                </h2>

                                <button

                                    onClick={() => setShowEditModal(false)}

                                    className="text-2xl hover:text-red-500"
                                >
                                    ✖
                                </button>

                            </div>

                            {/* IMAGE */}
                            <div className="flex justify-center mb-8">

                                <div className="relative">

                                    <img
                                        src={
                                            formData.profilePic
                                                ? URL.createObjectURL(formData.profilePic)
                                                : user?.profilePic
                                        }
                                        alt=""
                                        className="w-40 h-40 rounded-full object-cover border-4 border-indigo-500"
                                    />

                                    <label className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full cursor-pointer hover:bg-indigo-700">

                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleImage}
                                        />

                                        📷
                                    </label>

                                </div>

                            </div>

                            {/* FORM */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="First Name"
                                    className="bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 focus:border-indigo-500"
                                />

                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Last Name"
                                    className="bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 focus:border-indigo-500"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    className="bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 focus:border-indigo-500"
                                />

                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="Age"
                                    className="bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 focus:border-indigo-500"
                                />

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="bg-slate-800 p-4 rounded-2xl outline-none border border-slate-700 focus:border-indigo-500"
                                >

                                    <option value="">
                                        Select Gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                </select>

                            </div>

                            {/* BUTTONS */}
                            <div className="flex justify-end gap-4 mt-10">

                                <button

                                    onClick={() => setShowEditModal(false)}

                                    className="px-6 py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-bold"
                                >
                                    Cancel
                                </button>

                                <button

                                    onClick={updateProfile}

                                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-all font-bold"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </div>

                    </div>
                )
            }

        </div>
    );
};