'use client'

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box
} from '@mui/material';
import {  useTextContext } from '@/context/context';

type SimpleCardProps = {
  title: string;
  description: string;
  action: string;
  event: () => void;
  img: string;
};

export default function SimpleCard({title, description, action, event, img}: SimpleCardProps) {
    const {isSmallScreen} = useTextContext();

  return (
    <Card 
        elevation={0}
        sx={isSmallScreen ? {
            width: '80vw',
            marginTop: '80px',
            marginLeft: 'auto',
            marginRight: 'auto',
            overflow: 'hidden',
        } : {
            width: '100%',
            marginTop: {
                xs: 5, 
                sm: 10, 
                md: 15,
                lg: 20  
            },
            marginLeft: {
                xs: 5,  
                sm: 10,
                md: 15,
                lg: 20  
            },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            gap: {
                xs: 5, 
                sm: 10,
                md: 20,
                lg: 30
            },
            alignItems: 'center'
        }
        }
    >
        <Box
            sx={{
                width: isSmallScreen ? '100%' : '30%',
                aspectRatio: '1.5 / 1',
                overflow: 'hidden',
                borderRadius: '15px'
            }}
        >
            <CardMedia
                component="img"
                image={img}
                alt="Placeholder Image"
                sx={{
                    width: '100%',
                    height: '100%',
                }}
            />
        </Box>

        <Box>
            <CardContent>
                <Typography 
                    sx={{
                        fontFamily: 'var(--font-poppins)',
                        fontWeight: '600'
                    }}
                    gutterBottom 
                    variant="h5"
                    component="div"
                >
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </CardContent>

            <CardActions>
                <Button
                    aria-label={action} 
                    onClick={event}
                    variant='contained'
                    size="small" 
                    sx={{ 
                        borderRadius: '10px',
                        padding: '10px 30px',
                        fontSize: '15px',
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: '#4FC122'
                    }}
                >
                    {action}
                </Button>
            </CardActions>
        </Box>
    </Card>
  );
}
