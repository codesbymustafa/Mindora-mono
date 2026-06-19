import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'
import TweetCard from '../components/TweetCard'
import Button from '../components/Button'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'

function Home() {
    const { api } = useAuth()
    const location = useLocation()
    const [videos, setVideos] = useState([])
    const [tweets, setTweets] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Determine active tab based on URL
    const activeTab = location.pathname === '/tweets' ? 'tweets' : 'videos'

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                // Fetch both initially, or optimize to fetch only what's needed based on tab
                // For now, fetching both as per original design
                const [videosRes, tweetsRes] = await Promise.all([
                    api.get('/videos/'),
                    api.get('/tweets/')
                ])
                
                // Handle Videos Response Structure: 
                // Doc says: res.data.data.data is the array
                const videoData = videosRes.data.data?.data || videosRes.data.data?.docs || videosRes.data.data
                if (Array.isArray(videoData)) {
                    setVideos(videoData)
                } else {
                    console.error("Unexpected video data format:", videosRes.data)
                    setVideos([])
                }

                // Handle Tweets Response Structure: 
                // Doc says: res.data.data is the array
                const tweetData = tweetsRes.data.data
                if (Array.isArray(tweetData)) {
                    setTweets(tweetData)
                } else {
                    console.error("Unexpected tweet data format:", tweetsRes.data)
                    setTweets([])
                }
            } catch (error) {
                console.error("Error fetching home data", error)
                toast.error("Failed to load feed")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [api])

    const handleLikeTweet = async (tweetId) => {
        try {
            await api.post(`/like/t/${tweetId}`)
            // Optimistic update or refetch
            setTweets(prev => prev.map(t => {
                if (t._id === tweetId) {
                    return {
                        ...t,
                        isLiked: !t.isLiked,
                        likesCount: t.isLiked ? t.likesCount - 1 : t.likesCount + 1
                    }
                }
                return t
            }))
        } catch (error) {
            console.error("Error liking tweet", error)
            toast.error("Failed to like tweet")
        }
    }

    const [newTweet, setNewTweet] = useState('')

    const handleCreateTweet = async (e) => {
        e.preventDefault()
        if (!newTweet.trim()) return
        try {
            const res = await api.post('/tweets/', { content: newTweet })
            // Response structure for created tweet: res.data.message (based on doc) or res.data.data
            // Doc says: res.data.data contains the tweet object
            const createdTweet = res.data.data
            setTweets(prev => [createdTweet, ...prev])
            setNewTweet('')
            toast.success("Tweet posted")
        } catch (error) {
            console.error("Error creating tweet", error)
            toast.error("Failed to post tweet")
        }
    }

    if (loading) {
        return <Loader />
    }

  return (
    <div className="text-white">
        <div className="flex gap-4 mb-6 border-b border-gray-700 pb-2">
            <Link 
                to="/videos"
                className={`px-4 py-2 font-medium ${activeTab === 'videos' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
                Videos
            </Link>
            <Link 
                to="/tweets"
                className={`px-4 py-2 font-medium ${activeTab === 'tweets' ? 'text-purple-500 border-b-2 border-purple-500' : 'text-gray-400 hover:text-white'}`}
            >
                Tweets
            </Link>
        </div>

        {activeTab === 'videos' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.length > 0 ? (
                    videos.map(video => (
                        <VideoCard key={video._id} video={video} />
                    ))
                ) : (
                    <p className="text-gray-400 col-span-full text-center">No videos found</p>
                )}
            </div>
        ) : (
            <div className="max-w-2xl mx-auto space-y-4">
                {/* Create Tweet Form */}
                <form onSubmit={handleCreateTweet} className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6">
                    <textarea 
                        value={newTweet}
                        onChange={(e) => setNewTweet(e.target.value)}
                        onKeyDown={(e) => {
                            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                                e.preventDefault()
                                if (newTweet.trim()) {
                                    handleCreateTweet(e)
                                }
                            }
                        }}
                        placeholder="What's on your mind?"
                        className="w-full bg-transparent border-none focus:ring-0 text-white resize-none outline-none"
                        rows="3"
                    />
                    <div className="flex justify-end border-t border-gray-700 pt-3 mt-2">
                        <Button type="submit" disabled={!newTweet.trim()} className="py-1 px-4 rounded-full">
                            Tweet
                        </Button>
                    </div>
                </form>

                {tweets.length > 0 ? (
                    tweets.map(tweet => (
                        <TweetCard key={tweet._id} tweet={tweet} onLike={handleLikeTweet} />
                    ))
                ) : (
                    <p className="text-gray-400 text-center">No tweets found</p>
                )}
            </div>
        )}
    </div>
  )
}

export default Home
