// import {Routes, Route, Navigate } from "react-router";
// import Homepage from "./pages/Homepage"
// import Login from "./pages/Login"
// import Signup from "./pages/Signup"
// import { checkAuth } from "./authSlice";
// import { useDispatch,useSelector } from "react-redux";
// import { useEffect } from "react";
// function App() {
//  //check this person is authenticated or not if not then go to login and signup page else go to homepage
// const {isAuthenticated}=useSelector((state)=>state.auth)
// const dispatch=useDispatch();
// useEffect(()=>{
// dispatch(checkAuth())
// },[dispatch])
//   return (
//     <>

// <Routes>
// <Route path="/" element={isAuthenticated ? <Homepage /> : <Navigate to="/signup" />} />
// <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
// <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
// </Routes>

//     </>
//   )
// }

// export default App


import { Routes, Route, Navigate } from "react-router";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import { checkAuth } from "./authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import AdminPanel from "./pages/AdminPanel";
import ProblemPage from "./pages/ProblemPage";
import { Toaster } from "react-hot-toast";

function App() {
  //check this person is authenticated or not if not then go to login and signup page else go to homepage
  const { isAuthenticated,user,loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if(loading){
   return (

  <div className="flex items-center justify-center h-screen">
    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

  }
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
         <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
        <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
        <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
       <Route path="/admin" element={isAuthenticated && (user?.role === 'admin' || user?.role === 'demoAdmin') ? <AdminPanel/> : <Navigate to="/" />} />
        <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      </Routes>
    </>
  );
}

export default App;