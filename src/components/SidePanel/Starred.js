import React from 'react';
import { connect } from 'react-redux';
import firebase from '../../firebase';
import { setCurrentChannel, setPrivateChannel } from '../../actions'
import { Menu, Icon } from 'semantic-ui-react';

class Starred extends React.Component {
    state = {
        user: this.props.currentUser,
        userRef: firebase.database().ref('users'),
        activeChannel: '',
        starredChannels: []
    }

    componentDidMount() {
        if (this.state.user) {
            this.addListeners(this.state.user.uid);
        }
    }

    addListeners = (userId) => {
        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_added', snap => {
                const starredChannel = { id: snap.key , ...snap.val()}
                this.setState({
                    starredChannels: [...this.state.starredChannels, starredChannel ]
                })
            });

        this.state.userRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap => {
                const channelToRemove = { id: snap.key, ...snap.val() }
                const filteredChannels = this.state.starredChannels.filter(channel => {
                   return channel.id !== channelToRemove.id;
                });

                this.setState({ 
                    starredChannels: [...filteredChannels]
                });
            })
    }


    displayChannels = channels => {
        return channels.length > 0 && channels.map(channel => (
            <Menu.Item
                key={channel.id}
                onClick={this.changeChannel}
                name={channel.id}
                channel={channel}
                active={channel.id === this.state.activeChannel}
                style={{ opacity: 0.7 }}
            >
                # {channel.name}
            </Menu.Item>
        ))
    }

    
    changeChannel = (event, item) => {
        this.setActiveChannel(item.channel);
        this.props.setCurrentChannel(item.channel);
        this.props.setPrivateChannel(false);
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id });
    }    

    render() {
        const { starredChannels } = this.state;
        return (
            <Menu.Menu className='menu'>
                    <Menu.Item>
                        <span>
                            <Icon name="star" /> STARRED
                        </span>{" "}
                        ({ starredChannels.length })
                    </Menu.Item>
                    {this.displayChannels(starredChannels)}
                </Menu.Menu>
        );
    }
}

export default connect(null,
    {
        setCurrentChannel,
        setPrivateChannel
    })(Starred);