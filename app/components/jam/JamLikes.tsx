"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FaHeart } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";

interface likeStats {
    jamId: string;
}

// Error handling utility
const handleError = (error: unknown, context: string): string => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  console.error(`${context}:`, errorMessage);
  return errorMessage;
};

export function JamLikes({ jamId }: likeStats) {
    const [liked, setLiked] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleLikeToggle = async () => {
        if (isLoading) return; // Prevent double clicks
        
        setIsLoading(true);
        
        // Optimistic update
        const wasLiked = liked;
        const previousCount = totalLikes;
        setLiked(!liked);
        setTotalLikes(liked ? totalLikes - 1 : totalLikes + 1);

        try {
            const response = await fetch(`/api/jams/${jamId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to toggle like');
            }

            const data = await response.json();
            
            // Update with actual values from server
            setLiked(data.liked);
            setTotalLikes(data.likesCount);

        } catch (error) {
            console.error('Error toggling like:', error);
            
            // Revert optimistic update on error
            setLiked(wasLiked);
            setTotalLikes(previousCount);
            
            handleError(error, 'Failed to toggle like');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let isMounted = true;
        
        const getLikeStatus = async () => {
            try {
                const response = await fetch(`/api/jams/${jamId}/like`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch like status');
                }

                const data = await response.json();
                
                // Only update state if component is still mounted
                if (isMounted) {
                    setLiked(data.liked);
                    setTotalLikes(data.likesCount);
                }
                
            } catch (error) {
                if (isMounted) {
                    handleError(error, 'Failed to fetch like status');
                }
            }
        };

        getLikeStatus();
        
        // Cleanup function to prevent memory leaks
        return () => {
            isMounted = false;
        };
    }, [jamId]);

    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                    <FaHeart className="w-4 h-4" />
                    <span>Jam Likes</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center w-full">
                    <Button
                        onClick={handleLikeToggle}
                        disabled={isLoading}
                        variant="outline"
                        className="flex items-center space-x-2 w-full justify-start"
                    >
                        <FaHeart 
                            className={`w-4 h-4 ${
                                liked ? 'text-red-500' : 'text-gray-400'
                            } ${isLoading ? 'opacity-50' : ''}`} 
                        />
                        <span>{totalLikes} {totalLikes === 1 ? 'Like' : 'Likes'}</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}