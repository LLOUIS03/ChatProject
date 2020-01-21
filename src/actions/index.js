import * as actionTypes from './types';

// User actions
export const setUser = user => {
    return {
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    }
}

export const clearUser = () => {
    return {
        type: actionTypes.CLEAR_USER,
    }
}

// Channel actions
export const setCurrentChannel = channel => {
    return {
        type: actionTypes.SET_CURRENT_CHANNEL,
        payload: {
           currentChannel: channel,
        },
    }
}

export const setPrivateChannel = isPrivateChannel => {
    return {
        type: actionTypes.SET_PRIVATE_CHANNEL,
        payload: {
            isPrivateChannel
        }
    };
}

export const setColors = (primary, secondary) => {
    return {
        type: actionTypes.SET_COLORS,
        payload: {
            primary,
            secondary
        }
    }
}

export const setUserPost = userPosts => {
    return {
        type: actionTypes.SET_USER_POSTS,
        payload:{
            userPosts
        }
    }
}