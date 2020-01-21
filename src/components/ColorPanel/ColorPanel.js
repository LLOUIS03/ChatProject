import React from 'react';
import{ Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from 'semantic-ui-react';
import { SliderPicker } from 'react-color';
import { connect } from 'react-redux';
import { setColors } from '../../actions/index';
import firebase from '../../firebase';

class ColorPanel extends React.Component {
    state = {
        modal: false,
        primary: '',
        secondary: '',
        userColors: [],
        user: this.props.currentUser,
        userRef: firebase.database().ref('users')
    }

    componentDidMount(){
        if(this.state.user){
            this.addListener(this.state.user.uid);
        }
    }

    addListener = userId => {
        const userColors = [];
        this.state.userRef
            .child(`${userId}/colors`)
            .on('child_added', snap => {
                userColors.unshift(snap.val());
                console.log(userColors);
                this.setState({ userColors })
            })            
    }

    handleSaveColor = () => {
        const { primary, secondary, user} = this.state;
        if (primary && secondary) {
            this.saveColors(primary, secondary, user);
        }
    }

    saveColors = (primary, secondary, user) => {
        this.state.userRef
            .child(`${user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            }).then(() => {
                console.log('Colors added')
                this.closeModal();
            })
            .catch(err => console.error(err));
    }

    handleChangePrimary = color => {
        this.setState({ primary: color })
    }

    handleChangeSecondary = color => {
        this.setState({ secondary: color })
    }    

    openModal = () => {
        this.setState({ modal: true });
    }

    closeModal = () => {
        this.setState({ modal: false });
    }

    displayUserColors = colors =>
        colors.length > 0 &&
        colors.map((color, i) => (
        <React.Fragment key={i}>
            <Divider />
            <div
                className="color__container"
                onClick={() => this.props.setColors(color.primary, color.secondary)}
            >
            <div className="color__square" style={{ background: color.primary.hex }}>
                <div
                className="color__overlay"
                style={{ background: color.secondary.hex }}
                />
            </div>
            </div>
        </React.Fragment>
        ));
    
    render() {
        const { modal, primary, secondary, userColors} = this.state;
        console.log(userColors)
        return (
            <Sidebar
                as={Menu}
                icon='labeled'
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />
                {this.displayUserColors(userColors)}
                <Modal 
                    basic 
                    open={modal}
                    onClose={this.closeModal}
                >
                    <Modal.Header>Chose app Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>
                            <Label content='Primary Color'/>
                            <SliderPicker color={primary} onChange={this.handleChangePrimary}/>
                        </Segment>
                        
                        <Segment inverted>
                            <Label content='Secondary Color'/>
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondary}/>
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button 
                            color='green'
                            inverted
                            onClick={this.handleSaveColor}
                        >
                         <Icon name='checkmark' />
                            Save Colors   
                        </Button>

                        <Button
                            color='red'
                            inverted
                            onClick={this.closeModal}
                        >
                         <Icon name='remove' />
                            Cancel   
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        );
    }
}

export default connect(
    null, 
    { setColors }
 )(ColorPanel);