import React from 'react';
import MessagesHeader from './MessagesHeader';
import MessageForm from './MessagesForm';
import { connect } from 'react-redux';
import { setUserPost } from '../../actions/index';
import { Segment, Comment } from 'semantic-ui-react';
import firebase from '../../firebase';
import Message from './Message';

class Messages extends React.Component {
    state = {
        messages: [],
        messagesLoading: true,
        progressBar: false,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        isChannelStarred: false,
        messageRef: firebase.database().ref('messages'),
        privateMessageRef: firebase.database().ref('privateMessages'),
        usersRef: firebase.database().ref('users'),
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        isPrivateChannel: this.props.isPrivateChannel,
    }

    handleStar = () => {
        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel());
    }

    starChannel = () => {
        if(this.state.isChannelStarred) {
            this.state.usersRef
                .child(`${this.state.currentUser.uid}/starred`)
                .update({
                    [this.state.channel.id]: {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })
        } else {
            this.state.usersRef
                .child(`${this.state.currentUser.uid}/starred`)
                .child(this.state.channel.id)
                .remove(err => {
                    if(err !== null){
                        console.error(err);
                    }
                })
        }
    }

    async componentDidMount() {
        const { channel, currentUser } = this.state;
        if(channel && currentUser) {
            this.addListeners(channel.id);
            await this.addUserStartsListener(channel.id, currentUser.uid);
        }
    }

    addListeners = channelId => {
        this.addMessageListener(channelId);
    }

    addUserStartsListener = async (channelId, userId) => {
        const data = await this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value');
        if (data.val() !== null){
            const channelIds = Object.keys(data.val());
            const prevStarred = channelIds.includes(channelId);
            this.setState({ isChannelStarred: prevStarred });
        }
    }

    countUserPost = messages => {
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc) {
                acc[message.user.name].count += 1;
            } else {
                acc[message.user.name]= {
                    avatar: message.user.avatar,
                    count: 1
                };
            }
            return acc;
        },{});
        this.props.setUserPost(userPosts);
    }

    addMessageListener = channelId => {
        const loadedMessages = [];
        const ref = this.getMessagesRef();
        ref
        .child(channelId)
        .on('child_added', snap => {
            loadedMessages.push(snap.val());
            this.setState({
                messages: loadedMessages,
                messagesLoading: false
            });
            this.countUniqueUsers(loadedMessages);
            this.countUserPost(loadedMessages);
        });
    }

    // can do better
    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name);
            }
            return acc;
        },[]);
        const plural = uniqueUsers.length > 1 ? 'users' : 'user';
        const numUniqueUsers = `${uniqueUsers.length} ${plural}`;
        this.setState({ numUniqueUsers });
    }


    displayMessages = messages =>
        messages.length > 0 &&
        messages.map(message => (
        <Message
            key={message.timestamp}
            message={message}
            user={this.state.currentUser}
        />
    ));

    isProgressBarVisible = percent => {
        if(percent > 0) {
            this.setState({ progressBar: true });
        }
    }

    displayChannelName = channel => {
        return channel ? `${this.state.isPrivateChannel ? '@' : '#'}${channel.name}` : '';
    }

    getMessagesRef = () => {
        const { messageRef, privateMessageRef, isPrivateChannel } = this.state;
        return isPrivateChannel ? privateMessageRef : messageRef;
    }

    handleSearchChange = event => {
        this.setState({
            searchTerm: event.target.value,
            searchLoading: true
        }, () => this.handleSearchMessages());
    }

    handleSearchMessages = () => {
        const channelMessages = [...this.state.messages];
        const regex = new RegExp(this.state.searchTerm, 'gi');
        const searchResults = channelMessages.reduce((acc, message) => {
            if ((message.content && message.content.match(regex)) || 
                message.user.name.match(regex)) {
                acc.push(message);
            }
            return acc;
        },[]);
        this.setState({ searchResults, searchLoading: false });
    }

    render() {
        const { 
            messageRef, 
            channel, 
            messages, 
            currentUser, 
            progressBar, 
            numUniqueUsers, 
            searchResults , 
            searchTerm,
            searchLoading,
            isPrivateChannel,
            isChannelStarred
        } = this.state;

        return (
            <React.Fragment>
                <MessagesHeader
                   channelName={this.displayChannelName(channel)}
                   numUniqueUsers={numUniqueUsers}
                   handleSearchChange={this.handleSearchChange}
                   searchLoading={searchLoading}
                   isPrivateChannel={isPrivateChannel}
                   handleStar={this.handleStar}
                   isChannelStarred={isChannelStarred}
                />

                <Segment>
                    <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
                        {searchTerm ? 
                            this.displayMessages(searchResults) :
                            this.displayMessages(messages)}
                    </Comment.Group>
                </Segment>

                <MessageForm 
                    messageRef={messageRef}
                    currentChannel={channel}
                    currentUser={currentUser}
                    isPrivateChannel={isPrivateChannel}
                    isProgressBarVisible={this.isProgressBarVisible}
                    getMessagesRef={this.getMessagesRef}
                />
            </React.Fragment>
        );
    }
}

export default connect(
    null, 
    { setUserPost }
)(Messages);