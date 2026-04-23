# mobile/docker/android-demo.Dockerfile
#
# Packages the i4g mobile app inside an Android 14 emulator container for offline demos.
# Intended for Linux x86_64 hosts — requires KVM for acceptable performance.
#
# Build (from mobile/ root):
#   make build-android-apk   # produces docker/android-demo/app.apk
#   make build-android-demo  # produces i4g-android-demo Docker image
#
# Run on Linux:
#   docker run --rm -d \
#     --device /dev/kvm \
#     -p 6080:6080 \
#     -p 5554:5554 \
#     -p 5555:5555 \
#     --name i4g-android-demo \
#     i4g-android-demo
#
#   Open http://localhost:6080 in your browser to see the emulator.
#   ADB is available on localhost:5555 (useful for sideloading / debugging).
#
# ⚠  KVM note: run `ls /dev/kvm` on the Linux host first. If the device is
#    missing, the emulator falls back to software rendering — too slow for demos.
#    Most bare-metal Linux laptops have KVM available out of the box.

FROM budtmo/docker-android:emulator_14.0

# Pre-built APK — produced by `make build-android-apk`.
# The budtmo entrypoint reads ADDITIONAL_APKS and installs every listed file
# once the emulator finishes booting.
COPY docker/android-demo/app.apk /root/tmp/apk/app.apk
ENV ADDITIONAL_APKS=/root/tmp/apk/app.apk

# Emulator device profile and storage size.
ENV DEVICE="Pixel 6"
ENV DATAPARTITION="4096m"
