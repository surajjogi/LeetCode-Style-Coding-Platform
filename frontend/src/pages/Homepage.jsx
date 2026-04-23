import { useDispatch, useSelector } from "react-redux";
import axiosClient from "../utils/axiosClient";
import { logoutUser } from "../authSlice";
import { NavLink, UNSAFE_SingleFetchRedirectSymbol } from "react-router";
import { useEffect, useState } from "react";

// function Homepage() {
//     const dispatch = useDispatch();
//     const { user } = useSelector((state) => state.auth);
//     const [problem, setProblem] = useState([]);
//     const [solvedProblem, setSolvedProblem] = useState([]);
//     const [filters, setFilters] = useState({
//         difficulty: "all",
//         tags: "all",
//         status: "all",
//     });
//     //logout api call
//     const handleLogout = () => {
//         dispatch(logoutUser());
//     };

//     useEffect(() => {
//         const fetchProblems = async () => {
//             try {
//                 const { data } = await axiosClient.get("/problem/getAllProblem");
//                 setProblem(data.data);
//             } catch (error) {
//                 console.log("error fetching problem", error);
//             }
//         };

//         const fetchSolvedProblem = async () => {
//             try {
//                 const { data } = await axiosClient.get("/problem/problemSolvedByUser");
//                 setSolvedProblem(data);
//             } catch (error) {
//                 console.log("error fetching Solved problem", error);
//             }
//         };

//         fetchProblems();
//         if (user) {
//             fetchSolvedProblem();
//         }
//     }, [user]);

//     const filteredProblems = problem.filter((problem) => {
//         const difficultyMatch =
//             filters.difficulty === "all" || problem.difficulty === filters.difficulty;
//         const tagsMatch = filters.tags === "all" || problem.tags === filters.tags;
//         const statusMatch =
//             filters.status === "all" ||
//             solvedProblem.some((sp) => sp._id === problem._id);
//         return difficultyMatch && tagsMatch && statusMatch;
//     });

//     return (
//         <>
//             <div className="min-h-screen bg-base-100">
//                 {/* {navbar} */}
//                 <nav className="navbar shadow-lg px-4">
//                     <div className="flex-1">
//                         <NavLink to="/" className="btn btn-ghost text-xl">
//                             LEETCODE
//                         </NavLink>
//                     </div>
//                     <div className="flex-none gap-4">
//                         <div className="dropdown dropdown-end">
//                             <div tabIndex={0} className="btn btn-ghost">
//                                 {user?.firstName}
//                             </div>
//                             <ul className="mt-3 shadow-sm menu-sm dropdown-content bg-base-100 rounded-box w-52">
//                                 <li>
//                                     <button onClick={handleLogout}>Logout</button>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </nav>

//                 {/* {main content} */}

//                 <div className="container mx-auto p-4">
//                     {/* {filters} */}
//                     <div className="flex flex-wrap gap-4 mb-6">
//                         <select
//                             value={filters.status}
//                             className="select select-primary"
//                             onChange={(e) =>
//                                 setFilters({ ...filters, status: e.target.value })
//                             }
//                         >
//                             <option value="all">All Problem</option>
//                             <option value="solved">Solved Problem</option>
//                         </select>

//                         <select
//                             value={filters.difficulty}
//                             className="select select-primary"
//                             onChange={(e) =>
//                                 setFilters({ ...filters, difficulty: e.target.value })
//                             }
//                         >
//                             <option value="all">All difficulties</option>
//                             <option value="easy">Easy</option>
//                             <option value="medium">medium</option>
//                             <option value="hard">Hard</option>
//                         </select>
//                         <select
//                             value={filters.tags}
//                             className="select select-primary"
//                             onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
//                         >
//                             <option value="all">All</option>
//                             <option value="array">Array</option>
//                             <option value="linkedList">Linked List</option>
//                             <option value="dp">DP</option>
//                         </select>
//                     </div>

//                     {/* {displayed content} */}
//                     <div className="card bg-base-100 w-96 shadow-sm">
//                         {problem.map((problem)=>(
//                         <div className="card-body">
//                             <h2 className="card-title">
//                                 {problem.title}
//                             </h2>
                          
//                             <div className="card-actions justify-end">
//                                 <div className="badge badge-outline">{problem.difficulty}</div>
//                                 <div className="badge badge-outline">{problem.tags}</div>
//                             </div>
//                         </div>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }
// export default Homepage;


function Homepage() {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [problem, setProblem] = useState([]);
    const [solvedProblem, setSolvedProblem] = useState([]);
    const [filters, setFilters] = useState({
        difficulty: "all",
        tags: "all",
        status: "all",
    });
    
    //logout api call
    const handleLogout = () => {
        dispatch(logoutUser());
    };

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await axiosClient.get("/problem/getAllProblem");
                setProblem(data.data);
            } catch (error) {
                console.log("error fetching problem", error);
            }
        };

        const fetchSolvedProblem = async () => {
            try {
                const { data } = await axiosClient.get("/problem/problemSolvedByUser");
                setSolvedProblem(data);
            } catch (error) {
                console.log("error fetching Solved problem", error);
            }
        };

        fetchProblems();
        if (user) {
            fetchSolvedProblem();
        }
    }, [user]);

    const filteredProblems = problem.filter((problem) => {
        const difficultyMatch =
            filters.difficulty === "all" || problem.difficulty === filters.difficulty;
        const tagsMatch = filters.tags === "all" || (problem.tags && problem.tags.toLowerCase() === filters.tags.toLowerCase());
        const statusMatch =
            filters.status === "all" ||
            solvedProblem.some((sp) => sp._id === problem._id);
        return difficultyMatch && tagsMatch && statusMatch;
    });

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Minimal Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-sm border-b border-white/5">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="text-2xl font-light tracking-wider">
                            <span className="text-white">code</span>
                            <span className="text-purple-400 font-normal">/arena</span>
                        </div>

                        {/* User Menu */}
                        <div className="dropdown dropdown-end">
                            <div 
                                tabIndex={0} 
                                className="flex items-center gap-3 cursor-pointer group"
                            >
                                <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                                    {user?.firstName}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-sm text-purple-400">
                                    {user?.firstName?.charAt(0)}
                                </div>
                            </div>
                            <ul className="mt-2 dropdown-content w-48 bg-black border border-white/10 rounded-lg shadow-2xl">
                                <li>
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </li>
                                 {(user.role === 'admin' || user.role === 'demoAdmin') && <li className="w-full px-4 py-3 text-left text-sm text-purple-400 hover:bg-white/5 transition-colors flex items-center gap-2"><NavLink to="/admin" className="w-full">Admin Panel {user.role === 'demoAdmin' && <span className="text-xs text-white/30 ml-1">(read-only)</span>}</NavLink></li>}
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content - with padding for fixed navbar */}
            <div className="container mx-auto px-6 pt-24 pb-12">
                {/* Header */}
                <div className="mb-16 relative">
    {/* Background accent */}
    <div className="absolute -left-4 top-0 w-1 h-12 bg-linear-to-b from-purple-400 to-transparent"></div>
    
    <div className="space-y-2">
        <h1 className="text-5xl font-light tracking-wide">
            <span className="bg-linear-to-r from-white to-white/60 bg-clip-text text-transparent">
                problems
            </span>
            <span className="text-purple-400 ml-3 font-thin text-4xl animate-pulse">✦</span>
        </h1>
        <p className="text-white/30 text-xs uppercase tracking-[0.3em] font-light pl-4">
            select a challenge to begin
        </p>
    </div>
</div>

                {/* Quick Stats - Minimal */}
                <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-light text-purple-400">{problem.length}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mt-1">total</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-light text-green-400">{solvedProblem.length}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mt-1">solved</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                        <div className="text-2xl font-light text-white/60">{problem.length - solvedProblem.length}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mt-1">pending</div>
                    </div>
                </div>

                {/* Filters - Clean and minimal */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <select
                        value={filters.status}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-purple-400/50 transition-colors cursor-pointer"
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all" className="bg-black">all</option>
                        <option value="solved" className="bg-black">solved</option>
                    </select>

                    <select
                        value={filters.difficulty}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-purple-400/50 transition-colors cursor-pointer"
                        onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                    >
                        <option value="all" className="bg-black">all difficulties</option>
                        <option value="easy" className="bg-black">easy</option>
                        <option value="medium" className="bg-black">medium</option>
                        <option value="hard" className="bg-black">hard</option>
                    </select>

                    <select
                        value={filters.tags}
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-purple-400/50 transition-colors cursor-pointer capitalize"
                        onChange={(e) => setFilters({ ...filters, tags: e.target.value })}
                    >
                        <option value="all" className="bg-black">all tags</option>
                        {[...new Set(problem.map(p => p.tags?.toLowerCase()).filter(Boolean))].map(tag => (
                            <option key={tag} value={tag} className="bg-black capitalize">{tag}</option>
                        ))}
                    </select>
                </div>

                {/* Problems List - Clean card design */}
                <div className="space-y-2">
                    {filteredProblems.map((problem, index) => {
                        const isSolved = solvedProblem.some(sp => sp._id === problem._id);
                        
                        return (
                            <NavLink
                                to={`/problem/${problem._id}`}
                                key={problem._id}
                                className="group relative block"
                            >
                                {/* Card */}
                                <div className={`
                                    relative bg-white/5 rounded-lg p-4 
                                    transition-all duration-200 ease-out
                                    hover:bg-white/10 hover:scale-[1.02] hover:-translate-y-0.5
                                    cursor-pointer border border-transparent hover:border-purple-400/20
                                `}>
                                    <div className="flex items-center gap-4">
                                        {/* Status Indicator */}
                                        <div className={`
                                            w-2 h-2 rounded-full shrink-0
                                            transition-colors duration-200
                                            ${isSolved ? 'bg-green-400' : 'bg-white/20 group-hover:bg-white/30'}
                                        `} />

                                        {/* Title */}
                                        <div className="flex-1">
                                            <h3 className="text-sm text-white/80 group-hover:text-white transition-colors">
                                                {problem.title}
                                            </h3>
                                        </div>

                                        {/* Tags & Difficulty */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-white/30 group-hover:text-white/40 transition-colors">
                                                #{problem.tags}
                                            </span>
                                            <span className={`
                                                text-xs px-2 py-1 rounded
                                                transition-colors duration-200
                                                ${problem.difficulty === 'easy' ? 'text-green-400/70 bg-green-400/5' : 
                                                  problem.difficulty === 'medium' ? 'text-yellow-400/70 bg-yellow-400/5' : 
                                                  'text-red-400/70 bg-red-400/5'}
                                            `}>
                                                {problem.difficulty}
                                            </span>
                                        </div>

                                        {/* Arrow on hover */}
                                        <svg 
                                            className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-all duration-200 group-hover:translate-x-0.5" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Subtle glow on hover */}
                                <div className="absolute inset-0 -z-10 bg-purple-500/0 group-hover:bg-purple-500/5 rounded-lg blur-xl transition-colors duration-200" />
                            </NavLink>
                        );
                    })}

                    {/* Empty state */}
                    {filteredProblems.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-white/30 text-sm">no problems match your filters</p>
                        </div>
                    )}
                </div>
            </div>

          
        </div>
    );
}

export default Homepage;