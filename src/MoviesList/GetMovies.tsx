import { useEffect, useState } from "react";
import axios from "axios";
import LoaderComp from "../loader";

type movieDetails = {
    original_title: string,
    overview: string,
    release_date: string,
    popularity: number,
    vote_count: number,
    poster_path: string,
    backdrop_path: string,
    original_language: string
};

type queryList = {
    value: string
}


const GetMovies = () => {
    const moviesList = "https://api.themoviedb.org/3/search/movie?api_key=d4fbc0cd7f3b6b7ea3c3b8e5c74b8f46&language=en-US&query=spider";

    const [isLoading, setisLoading] = useState(true);
    const [movies, setMovies] = useState<movieDetails[]>([]);
    const [tempData, setTempData] = useState<movieDetails[]>([]);
    const [offset, setOffSet] = useState(6);
    const [isNextDisabled, setisNextDisabled] = useState(false);
    const [isPrevDisabled, setisPrevDisabled] = useState(false);
    const [query, setQuery] = useState<queryList>({
        value: " "
    });

    let starterOffset = 0;
    let data: movieDetails[] = [];
    let key_index = 0;

    useEffect(() => {
        axios({
            url: moviesList,
            method: 'GET',
        })
            .then((res) => {
                data = res.data.results;
                setTempData(data);
                const initialData = data.slice(starterOffset, offset); //0,6
                setMovies(initialData);
                setTimeout(() => {
                    setisLoading(false);
                }, 2000);
            })
            .catch((err) => {
                console.log(err);
            })
    }, [])

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen">
            <LoaderComp></LoaderComp>
        </div>
    }

    const handleForwardData = () => {
        // setisLoading(true);
        console.log(offset,"offset +");
        starterOffset = offset; //6
        const listNumber = offset + 6; //12
        // console.log
        if (listNumber <= 24) {
            setOffSet(listNumber);
            const reAssign = tempData.slice(starterOffset, listNumber); //6,12
            setTimeout(() => {
                setisLoading(false);
            }, 1000);
            setMovies(reAssign);
            if(listNumber==24)
            {
                setisNextDisabled(true);
            }
            console.log(starterOffset,listNumber,"++")
        }
    }

    const handleBackData = () => {
        setisLoading(true);
        const listNumber = offset - 6; //6
        starterOffset = listNumber - 6;

        setOffSet(listNumber);
        const reAssign = tempData.slice(starterOffset, listNumber);
        setMovies(reAssign);
        if(offset==6)
        {
            setisPrevDisabled(true);
        }
        console.log(starterOffset,offset,"--")
        setTimeout(() => {
            setisLoading(false);
        }, 1000);
    }

    //15, 12-18
    //20 18-24

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setQuery({ ...query, value: e.target.value });
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        setisLoading(true);
        event.preventDefault();
        let newQuery = query.value;
        newQuery = newQuery
            .split('')
            .map(char => (char === ' ' ? '%20' : char))
            .join('');
        const searchMovies = `https://api.themoviedb.org/3/search/movie?query=${newQuery}&include_adult=false&language=en-US&page=1`;
        
        axios({
            url: searchMovies,
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwZDk4MTdjNTBjODdmYjZhODAzZjRmNmYxZTRlYzMyNCIsInN1YiI6IjY1YzM2NGQ1M2ZlNzk3MDE4M2ZlZDJmYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.L9Gu6Z8g6lXlKamW5xpRhchs_qC938zx37s8sYOWDYE'
            }
        })
            .then((res) => {
                data = res.data.results;
                setTempData(data);
                setOffSet(6);
                starterOffset = 0;
                setisPrevDisabled(false);
                setisNextDisabled(false);
                const initialData = data.slice(0, 6);
                setMovies(initialData);
                setTimeout(() => {
                    setisLoading(false);
                }, 1000);
            })
            .catch((err) => console.log(err));
    }

    const handleFilter = async (value: string) => {
        if (value == "Years") {
            setisLoading(true);
            const sortedArray = tempData.sort((a, b) => {
                const dateA = new Date(a.release_date).getTime();
                const dateB = new Date(b.release_date).getTime();
                return dateA - dateB;
            });
            //set sorted list in temp data

            //update movies list 
            setOffSet(6); //6
            const initialData = tempData.slice(0, offset);

            setMovies(initialData);

            if(offset==6) 
            setTimeout(() => {
                setisLoading(false);
            }, 1000);
        }
        else 
        {
            setisLoading(true);
            const faMovie = tempData.filter((item)=>{
               return item.original_language == value;
            })


            setTempData(prevMovies=>{
                return prevMovies = faMovie;
            })

            setOffSet(6);

            //wait for setTemp to finish state update
            const initialData = faMovie.slice(0, 6);
            setMovies(initialData);

            if(faMovie.length<=6)
            {
                setisNextDisabled(true);
                setisPrevDisabled(true);
            }

            setTimeout(()=>
            {
                setisLoading(false);
            },1000);
        }

    }

    console.log(tempData, "tempdata");
    console.log(movies, "movies");
    console.log(offset,"offset");

    return (
        <div className="m-10 p-10 w-100">
            <form onSubmit={(e) => handleSubmit(e)}>
                <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        </svg>
                    </div>
                    <input onChange={handleChange} type="search" id="search" minLength={3} className="block w-full p-4 content-end ps-10 text-m text-white border border-gray-300 
                    rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 
                    " placeholder="Search movie with a keyword" required></input>
                    <button type="submit" className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Search</button>
                </div>
            </form>
            <div className="relative m-3">
                <ul className="flex flex-col gap-2 max-w-[280px] mx-auto mt-24">

                    <li >
                        <details className="group">

                            <summary
                                className="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">
                                <span className="flex gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        className="w-6 h-6">
                                        <path
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>

                                    <span>
                                        Filter by Year
                                    </span>
                                </span>
                                <svg className="w-5 h-5 text-gray-500 transition group-open:rotate-90" xmlns="http://www.w3.org/2000/svg"
                                    width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path
                                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                    </path>
                                </svg>
                            </summary>
                            <article className="px-4 pb-4">
                                <ul className="flex flex-col gap-1 pl-2">
                                    <li onClick={() => handleFilter("Years")}><a className="cursor-pointer">Oldest to Latest</a></li>
                                </ul>
                            </article>

                        </details>
                    </li>
                    <li>
                        <details className="group">
                            <summary
                                className="flex items-center justify-between gap-2 p-2 font-medium marker:content-none hover:cursor-pointer">

                                <span className="flex gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-6 h-6">
                                        <path
                                            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>

                                    <span>
                                        Filter by Language
                                    </span>
                                </span>
                                <svg className="w-5 h-5 text-gray-500 transition group-open:rotate-90" xmlns="http://www.w3.org/2000/svg"
                                    width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path
                                        d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z">
                                    </path>
                                </svg>
                            </summary>

                            <article className="px-4 pb-4">
                                <ul className="flex flex-col gap-1 pl-2">
                                    <li onClick={() => handleFilter("en")}><a className="cursor-pointer">English</a></li>
                                    <li onClick={() => handleFilter("fa")}><a className="cursor-pointer">FA</a></li>
                                </ul>
                            </article>
                        </details>
                    </li>
                </ul>
            </div>
            <div>
            </div>

            <div className="p-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-5 p-10 m-10">
                {
                    movies.map((list) => {
                        return (
                            <div className="rounded overflow-hidden shadow-lg shadow hover:shadow-2xl" key={key_index++}>
                                {
                                    (list.poster_path != null) ?
                                        <img className="w-full" src={'https://image.tmdb.org/t/p/w500/' + list.poster_path} alt="Poster"></img>
                                        :
                                        <img className="w-full" src={'https://image.tmdb.org/t/p/w500/' + list.backdrop_path} alt="Poster"></img>
                                }
                                <div className="px-6 py-4">
                                    <div className="font-bold text-xl mb-2">{list.original_title}</div>
                                    <p className="text-gray-700 text-base">
                                        {list.overview}
                                    </p>
                                </div>
                                <div className="px-6 pt-4 pb-2">
                                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">{list.vote_count} Votes</span>
                                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Release Date: {list.release_date}</span>
                                    <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Popularity: {list.popularity}</span>
                                </div>
                            </div>                            
                        )
                    })
                }
            </div>

            <button onClick={handleBackData}
                className={isPrevDisabled ? "bg-gray-300 text-gray-600 rounded-md m-6 p-6 px-4 py-2 pointer-events-none" : "m-6 p-6"}>Previous</button>
            <button onClick={handleForwardData}
                className={isNextDisabled ? "bg-gray-300 text-gray-600 rounded-md m-6 p-6 px-4 py-2 pointer-events-none" : "m-6 p-6"}>Next</button>
        </div>

    )
}

export default GetMovies;