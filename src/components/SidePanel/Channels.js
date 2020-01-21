import React from 'react';
import firebase from '../../firebase';
import { connect } from 'react-redux';
import { setCurrentChannel, setPrivateChannel } from '../../actions/index';
import { Menu, Icon, Modal, Form, Input, Button, Label } from 'semantic-ui-react';

class Channels extends React.Component{
    state = {
        channels: [],
        channel: null,
        modal: false,
        firstLoad: true,
        channelName: '',
        channelDetails: '',
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        notifications: [],
        currentUser: this.props.currentUser,
        activeChannel: ''
    }

    componentDidMount() {
        this.addListener();
    }

    componentWillUnmount() {
        this.removeListeners();
    }

    removeListeners = () => {
        this.state.channelsRef.off();
    }

    addListener = () => {
        const loadedChannels = [];
        const { channelsRef } = this.state;

        channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val());
            this.setState({channels: loadedChannels}, () => this.setFirstChannel());
            this.addNotificationListener(snap.key);
        });
    }

    addNotificationListener = channelId => {
        this.state.channelsRef.child(channelId).on('value', snap => {
            if (this.state.channel) {
                this.handleNotifications(channelId, 
                    this.state.channel.id,
                    this.state.notifications,
                    snap
                );
            }
        });
    }

    handleNotifications = (channelId, currentChannelId, notifications, snap) => {
        let lastTotal = 0;

        let index = notifications.findIndex(notification => notification.id === channelId);

        if (index !== -1){
            if (channelId !== currentChannelId) {
                lastTotal = notifications[index].total;

                if (snap.numChildren() - lastTotal > 0) {
                    notifications[index].count = snap.numChildren() - lastTotal;
                }
            }
            notifications[index].lastKnowTotal = snap.numChildren();
        } else {
            notifications.push({
                id:channelId,
                total: snap.numChildren(),
                lastKnowTotal: snap.numChildren(),
                count: 0
            })
        }

        this.setState({ notifications })
    }

    setFirstChannel = () => {
        const {firstLoad, channels} = this.state;        
        if(firstLoad && channels.length > 0) {
            const firstChannel = channels[0];
            this.props.setCurrentChannel(firstChannel);
            this.setActiveChannel(firstChannel);
            this.setState({ channel: firstChannel });
        }
        this.setState({ firstLoad: false });
    }

    addChannel = () => {
        const { channelsRef, channelName, channelDetails, currentUser } = this.state;

        const key = channelsRef.push().key;

        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy: {
                name: currentUser.displayName,
                avatar: currentUser.photoURL
            }
        };

        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {
                this.setState({ channelName: '', channelDetails: '' });
                this.closeModal();
            })
            .catch(err => {
                console.log(err);
            });
    }

    handleSubmit = event => {
        event.preventDefault();
        if (this.isFormValid(this.state)){
            this.addChannel();
        }
    }

    isFormValid = ({ channelName, channelDetails }) => {
        return channelName && channelDetails
    }

    closeModal = () => {
        this.setState({ modal: false });
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value })
    }

    changeChannel = (event, item) => {
        this.setActiveChannel(item.channel);
        this.clearNotifications();
        this.props.setCurrentChannel(item.channel);
        this.props.setPrivateChannel(false);
        this.setState({ channel: item.channel });
    }

    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => {
            return notification.id === this.state.channel.id;
        });

        if(index !== -1) {
            let updatedNotifications = [...this.state.notifications];
            updatedNotifications[index].total = this.state.notifications[index].lastKnowTotal;
            updatedNotifications[index].count = 0;
            this.setState({ notifications: updatedNotifications });
        }
    }

    setActiveChannel = channel => {
        this.setState({ activeChannel: channel.id });
    }

    openModal = () => {
        this.setState({ modal: true });
    }

    getNotificationCount = channel => {
        let count = 0;

        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id) {
                count = notification.count;
            }
        });

        if(count > 0) {
            return count;
        }
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
                {this.getNotificationCount(channel) && (
                    <Label color='red'>{this.getNotificationCount(channel)}</Label>
                )}
                # {channel.name}
            </Menu.Item>
        ))
    }

    render() {
        const { channels, modal } = this.state;
        return (
            <React.Fragment>
                <Menu.Menu className='menu'>
                    <Menu.Item>
                        <span>
                            <Icon name="exchange" /> CHANNELS
                        </span>{" "}
                        ({ channels.length }) <Icon name="add" onClick={this.openModal} />
                    </Menu.Item>
                    {this.displayChannels(channels)}
                </Menu.Menu>

                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Add a Channel</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.handleSubmit}>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="Name of Channel"
                                    name="channelName"
                                    onChange={this.handleChange}
                                    value={this.state.channelName}
                                />
                            </Form.Field>
                            <Form.Field>
                                <Input
                                    fluid
                                    label="About the Channel"
                                    name="channelDetails"
                                    onChange={this.handleChange}
                                    value={this.state.channelDetails}
                                />
                            </Form.Field>
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSubmit}>
                            <Icon name="checkmark"/> Add
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </React.Fragment>
        );
    }
}

export default connect(
    null, 
    { setCurrentChannel, setPrivateChannel }
    )(Channels); 