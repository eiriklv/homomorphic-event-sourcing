{-# LANGUAGE DataKinds         #-}
{-# LANGUAGE FlexibleContexts  #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE TypeOperators     #-}

import           Control.Concurrent.MVar
import           Control.Monad.Except
import           Control.Monad.Reader
import qualified Data.ByteString.Lazy     as LBS
import           Data.Monoid              ((<>))
import           Data.Proxy
import           Data.Text
import           Data.Text.Encoding       (encodeUtf8)
import           Network.Wai.Handler.Warp (run)
import           PetStore.Messages
import           PetStore.Model
import           Servant
import           System.Environment


type PetStoreApi = "pets" :> Get '[JSON] [ Pet ]
                   :<|> "pets" :> ReqBody '[JSON] Pet :> Post '[JSON] Output
                   :<|> "pets" :> ReqBody '[JSON] Pet :> Delete '[JSON] Output

petStoreApi :: Proxy PetStoreApi
petStoreApi = Proxy

main :: IO ()
main = do
  [port] <- getArgs
  store <- newMVar (PetStore [])
  putStrLn $ "starting mock HTTP PetStore on port " <> port
  void $ run (read port) (serve petStoreApi $ enter (runServer store) handler)
    where
      runServer store = NT $ Handler . flip runReaderT store

      handler = listPets :<|> addPet :<|> removePet

      addPet    pet = action (Add pet)

      removePet pet = action  (Remove pet)

      listPets      = ask >>= (storedPets <$>) . liftIO . readMVar

      action act =  ask >>= \ st -> do
        pets <- liftIO $ takeMVar st
        let (res, pets') = petStore act pets
        liftIO $ putMVar st pets'
        case res of
          Just output -> return output
          Nothing     -> throwError $ err400 { errBody = LBS.fromStrict $ encodeUtf8 $ pack $ "failed to " <> show act }