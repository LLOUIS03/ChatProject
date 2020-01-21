import React from 'react';
import { Grid, Header, Icon, Dropdown, Image, Modal, Input, Button } from 'semantic-ui-react';
import firebase from '../../firebase';
import AvatarEditor from 'react-avatar-editor';

class UserPanel extends React.Component {
    state = {
        user: this.props.currentUser,
        previewImage: '',
        primaryColor: this.props.primaryColor,
        modal: false,
        croppedImage:'',
        blob: '',
        uploadCroppedImage: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        usersRef: firebase.database().ref('users'),
        metadata: {
            contetType: 'image/jpeg'
        }
    }

    openModal = () => {
        this.setState({ modal: true });
    }

    closeModal  = () => {
        this.setState({ modal: false });
    }

    dropDownOptions = () => [
        {
            key: 'user',
            text: (
                <span>
                    Signed is as<strong>{this.state.user.displayName}</strong>
                </span>),
            disabled: true
        },
        {
            key: 'avatar',
            text: <span onClick={this.openModal}>Change Avatar</span>
        },
        {
            key: 'signout',
            text: <span onClick={this.handleSignout}>Sign Out</span>
        }
    ];

    handleSignout = () => {
        firebase
            .auth()
            .signOut()
            .then(() => {
                console.log('signout');
            });
    }

    handleCropImage = () => {
        if (this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
               let imageUrl = URL.createObjectURL(blob);
               this.setState({
                   croppedImage: imageUrl,
                   blob
               });
            })
        }
    }

    uploadCroppedImage = () => {
        const { storageRef, userRef, blob, metadata } = this.state;
        storageRef.child(`avatars/user-${userRef.uid}`)
        .put(blob, metadata)
        .then(snap => {
            snap.ref.getDownloadURL().then(downloadURL => {
                this.setState({ uploadCroppedImage: downloadURL },
                () => this.changeAvatar())
            })
        })
    }

    changeAvatar = () => {
        this.state.userRef.updateProfile({
            photoURL: this.state.uploadCroppedImage
        }).then(() => {
            console.log('photo URL updated')
            this.closeModal();
        }).catch(err =>{
            console.error(err);
        })

        this.state.usersRef
            .child(this.state.user.uid)
            .update({ avatar: this.state.uploadCroppedImage })
            .then(() => {
                console.log('user avatar')
            }).catch(err => {
                console.error(err);
            })
    }

    handleChange = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        if(file) {
            reader.readAsDataURL(file);
            reader.addEventListener('load', () => {
                this.setState({ previewImage: reader.result });
            });
        }
    }

    render(){
        const { user, primaryColor, modal, previewImage, croppedImage, blob} = this.state;
        return(
            <Grid style={{ background: primaryColor.hex }}>
                <Grid.Column>
                    <Grid.Row style={{ padding: '1.2em', margin: 0 }}>
                        <Header inverted floated='left' as='h2'>
                            <Icon name="code" />
                            <Header.Content>DevChat</Header.Content>
                        </Header>
                        <Header style={{ padding: '0.25em' }} as='h4' inverted>
                            <Dropdown trigger={
                                <span>
                                    <Image src={user.photoURL} spaced='right' avatar />
                                    {this.state.user.displayName}
                                </span>
                            } options={this.dropDownOptions()}>
                            </Dropdown>
                        </Header>   
                    </Grid.Row>
                    <Modal 
                        basic 
                        open={modal}
                        onClose={this.onClose}>
                            <Modal.Header>Change Avatar</Modal.Header>
                            <Modal.Content>
                                <Input 
                                    fluid
                                    type='file'
                                    label='new avatar'
                                    name='previewImage'
                                    onChange={this.handleChange}
                                />
                                <Grid center stackable columns={2}>
                                    <Grid.Row centered>
                                        <Grid.Column className='ui center aligned grid'>
                                            {previewImage && (
                                                <AvatarEditor
                                                    ref={node => (this.avatarEditor = node)} 
                                                    image={previewImage}
                                                    width={120}
                                                    height={120}
                                                    border={50}
                                                    scale={1.2}
                                                />
                                            )}
                                        </Grid.Column>
                                        <Grid.Column>
                                            {croppedImage && (
                                                <Image 
                                                    style={{ margin: '3.5em auto'}}
                                                    width={100}
                                                    height={100}
                                                    src={croppedImage}
                                                />
                                            )}
                                        </Grid.Column>
                                    </Grid.Row>

                                </Grid>
                            </Modal.Content>
                            <Modal.Actions>
                                {croppedImage && (<Button
                                    onClick={this.uploadCroppedImage}
                                    color='green'
                                    inverted>
                                <Icon name='save'/> Change Avatar            
                                </Button>)}
                                <Button
                                    color='green'
                                    inverted
                                    onClick={this.handleCropImage}>
                                <Icon name='image'/> Preview            
                                </Button>
                                <Button
                                    color='red'
                                    inverted
                                    onClick={this.closeModal}>
                                <Icon name='save'/> Cancel            
                                </Button>
                            </Modal.Actions>

                    </Modal>
                </Grid.Column>
            </Grid>
        );
    }
}

export default UserPanel;